"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthErrorMessage, AuthHeader } from "@/components/auth/AuthShared";
import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button, Input } from "@/components/ui";
import { safeRedirectPath } from "@/lib/security/safeRedirect";
import { createClient } from "@/lib/supabase/client";

const URL_NOTICES: Record<string, string> = {
  link_invalid: "That link is invalid or has expired. Request a new one and try again.",
  too_many: "Too many attempts. Please wait a few minutes and try again.",
};

/**
 * Login form wired to Supabase email/password authentication.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlNotice = URL_NOTICES[searchParams.get("error") ?? ""] ?? null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      // One neutral message for every failure: it must not reveal whether the address has an account.
      setError(
        authError.status === 429
          ? "Too many attempts. Please wait a few minutes and try again."
          : "Incorrect email or password.",
      );
      setLoading(false);
      return;
    }

    router.push(safeRedirectPath(searchParams.get("redirect")));
    router.refresh();
  }

  return (
    <AuthCard>
      <AuthHeader title="Welcome back" subtitle="" variant="login" />

      <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
        {error || urlNotice ? <AuthErrorMessage>{error ?? urlNotice}</AuthErrorMessage> : null}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-mono text-label-mono tracking-wider text-on-surface-variant uppercase"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              leadingIcon={<MaterialIcon name="mail" className="text-lg" />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="password"
                className="font-mono text-label-mono tracking-wider text-on-surface-variant uppercase"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-body-sm text-primary transition-colors hover:text-secondary"
              >
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              leadingIcon={<MaterialIcon name="lock" className="text-lg" />}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          className="py-3.5 font-semibold shadow-cta hover:shadow-cta-hover"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <MaterialIcon name="progress_activity" className="animate-spin text-sm" />
              Signing in...
            </span>
          ) : (
            <>
              Sign In
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </>
          )}
        </Button>
      </form>

      <footer className="text-center">
        <p className="text-body-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary transition-colors hover:text-secondary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </footer>
    </AuthCard>
  );
}
