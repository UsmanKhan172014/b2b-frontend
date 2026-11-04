"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button, GlassCard, Input } from "@/components/ui";
import { MIN_PASSWORD_LENGTH, passwordProblem } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

interface SecurityTabProps {
  email: string;
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="font-mono text-label-mono uppercase text-on-surface-variant">
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Change the password (the current one is required) and sign out of every device.
 */
export function SecurityTab({ email }: SecurityTabProps) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const problem = passwordProblem(next, email);
    if (problem) return setMessage({ ok: false, text: problem });
    if (next !== confirm) return setMessage({ ok: false, text: "The two new passwords do not match." });
    if (next === current) return setMessage({ ok: false, text: "Choose a password you have not used here before." });

    setBusy(true);
    const supabase = createClient();
    // prove it is really the account owner (an unattended, signed-in laptop must not be enough)
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: current });
    if (verifyError) {
      setBusy(false);
      return setMessage({ ok: false, text: "Your current password is incorrect." });
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) {
      setBusy(false);
      return setMessage({
        ok: false,
        text: error.status === 422 ? error.message : "We could not update your password. Please try again.",
      });
    }
    await supabase.auth.signOut({ scope: "others" });
    setCurrent("");
    setNext("");
    setConfirm("");
    setBusy(false);
    setMessage({ ok: true, text: "Password updated. Every other device has been signed out." });
  }

  async function signOutEverywhere() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <GlassCard radius="section" className="p-6 sm:p-8">
        <h3 className="mb-6 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="lock" className="text-primary" />
          Change password
        </h3>

        <form className="space-y-6" onSubmit={changePassword} noValidate>
          <Field id="current-password" label="Current password">
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              disabled={busy}
            />
          </Field>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field id="new-password" label="New password">
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(event) => setNext(event.target.value)}
                disabled={busy}
              />
            </Field>
            <Field id="confirm-password" label="Confirm new password">
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                disabled={busy}
              />
            </Field>
          </div>
          <p className="text-body-sm text-on-surface-variant/70">
            At least {MIN_PASSWORD_LENGTH} characters, with a letter and a number.
          </p>

          {message ? (
            <p className={cn("text-body-sm", message.ok ? "text-secondary" : "text-error")} role="status">
              {message.text}
            </p>
          ) : null}

          <div className="flex justify-end border-t border-white/10 pt-6">
            <Button type="submit" size="sm" disabled={busy || !current || !next || !confirm}>
              {busy ? "Saving..." : "Update password"}
            </Button>
          </div>
        </form>
      </GlassCard>

      <GlassCard radius="section" className="p-6 sm:p-8">
        <h3 className="mb-2 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="devices" className="text-primary" />
          Sessions
        </h3>
        <p className="mb-6 text-body-sm text-on-surface-variant">
          Lost a device or used a shared computer? Sign out everywhere, including here.
        </p>
        <Button variant="ghost" size="sm" onClick={signOutEverywhere} disabled={busy}>
          Sign out of all devices
        </Button>
      </GlassCard>
    </div>
  );
}
