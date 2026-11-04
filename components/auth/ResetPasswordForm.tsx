"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthErrorMessage, AuthHeader } from "@/components/auth/AuthShared";
import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button, Input } from "@/components/ui";
import { MIN_PASSWORD_LENGTH, passwordProblem } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";

/**
 * Choose a password after following a reset link or accepting an invitation. The link signs the person in
 * (see /api/auth/verify); this page only works while that session exists.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const invited = useSearchParams().get("invited") === "1";
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (cancelled) return;
        setEmail(data.user?.email ?? null);
        setFullName(String(data.user?.user_metadata?.full_name ?? ""));
        setChecking(false);
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const problem = passwordProblem(password, email);
    if (problem) {
      setError(problem);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const trimmedName = fullName.trim().slice(0, 120);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      ...(invited && trimmedName ? { data: { full_name: trimmedName } } : {}),
    });

    if (updateError) {
      setError(
        updateError.status === 422
          ? updateError.message // e.g. "New password should be different from the old password."
          : "We could not update your password. The link may have expired; request a new one.",
      );
      setLoading(false);
      return;
    }

    // a changed password signs out every other device
    await supabase.auth.signOut({ scope: "others" });
    router.push("/dashboard");
    router.refresh();
  }

  if (checking) {
    return (
      <AuthCard>
        <p className="text-center text-body-sm text-on-surface-variant">Checking your link...</p>
      </AuthCard>
    );
  }

  if (!email) {
    return (
      <AuthCard>
        <AuthHeader title="Link expired" subtitle="" variant="login" />
        <AuthErrorMessage>
          This link is invalid or has already been used. Request a new password reset link to continue.
        </AuthErrorMessage>
        <p className="text-center text-body-sm text-on-surface-variant">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Request a new link
          </Link>
          {" · "}
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthHeader
        title={invited ? "Welcome to Sales Copilot" : "Choose a new password"}
        subtitle={
          invited
            ? "Set your name and a password to finish creating your account."
            : `Resetting the password for ${email}.`
        }
        variant="signup"
      />

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {error ? <AuthErrorMessage>{error}</AuthErrorMessage> : null}

        {invited ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="font-mono text-label-mono text-on-surface-variant uppercase">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              leadingIcon={<MaterialIcon name="person" className="text-lg" />}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-mono text-label-mono text-on-surface-variant uppercase">
            New Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            leadingIcon={<MaterialIcon name="lock" className="text-lg" />}
          />
          <p className="text-label-sm text-on-surface-variant/70">
            At least {MIN_PASSWORD_LENGTH} characters, with a letter and a number.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm" className="font-mono text-label-mono text-on-surface-variant uppercase">
            Confirm Password
          </label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
            leadingIcon={<MaterialIcon name="lock" className="text-lg" />}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          className="py-3 font-semibold shadow-glow-primary"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <MaterialIcon name="progress_activity" className="animate-spin text-sm" />
              Saving...
            </span>
          ) : invited ? (
            "Create my account"
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
