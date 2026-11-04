"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthErrorMessage, AuthHeader, AuthSuccessMessage } from "@/components/auth/AuthShared";
import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button, Input } from "@/components/ui";
import { MIN_PASSWORD_LENGTH, passwordProblem } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";

/**
 * Open sign-up. Every new account starts on the demo plan; an administrator upgrades it later.
 */
export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const problem = passwordProblem(password, email);
    if (problem) return setError(problem);
    if (password !== confirm) return setError("The two passwords do not match.");

    setLoading(true);
    const { data, error: authError } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim().slice(0, 120) } },
    });

    if (authError) {
      setError(
        authError.status === 429
          ? "Too many attempts. Please wait a few minutes and try again."
          : "We could not create your account. If you already have one, sign in instead.",
      );
      setLoading(false);
      return;
    }
    if (!data.session) {
      setCheckEmail(true); // e-mail confirmation is switched on in Supabase
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Create your account"
        subtitle="Start with a free demo: one research run of up to 5 leads."
        variant="signup"
      />

      {checkEmail ? (
        <AuthSuccessMessage>
          Check your inbox: we sent a confirmation link to <strong>{email.trim()}</strong>.
        </AuthSuccessMessage>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {error ? <AuthErrorMessage>{error}</AuthErrorMessage> : null}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="font-mono text-label-mono text-on-surface-variant uppercase">
                Full Name
              </label>
              <Input id="name" name="name" type="text" autoComplete="name" required placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)} disabled={loading}
                leadingIcon={<MaterialIcon name="person" className="text-lg" />} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-mono text-label-mono text-on-surface-variant uppercase">
                Work Email
              </label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="john@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
                leadingIcon={<MaterialIcon name="mail" className="text-lg" />} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="font-mono text-label-mono text-on-surface-variant uppercase">
                Password
              </label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required
                placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                disabled={loading} leadingIcon={<MaterialIcon name="lock" className="text-lg" />} />
              <p className="text-label-sm text-on-surface-variant/70">
                At least {MIN_PASSWORD_LENGTH} characters, with a letter and a number.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="font-mono text-label-mono text-on-surface-variant uppercase">
                Confirm Password
              </label>
              <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required
                placeholder="••••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                disabled={loading} leadingIcon={<MaterialIcon name="lock" className="text-lg" />} />
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={loading}
            className="py-3 font-semibold shadow-glow-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <MaterialIcon name="progress_activity" className="animate-spin text-sm" />
                Creating account...
              </span>
            ) : (
              <>
                Get Started
                <MaterialIcon name="arrow_forward" className="text-lg" />
              </>
            )}
          </Button>
        </form>
      )}

      <p className="text-center text-body-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login" className="text-primary transition-colors hover:text-secondary hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
