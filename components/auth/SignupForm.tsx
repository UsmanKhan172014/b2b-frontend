"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import {
  AuthDivider,
  AuthErrorMessage,
  AuthHeader,
  GoogleAuthButton,
} from "@/components/auth/AuthShared";
import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

/**
 * Sign-up form wired to Supabase email/password registration.
 */
export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (authError) {
      setError(authError.message);
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
        subtitle="Join LeadScope AI to unlock advanced enterprise insights."
        variant="signup"
      />

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {error && <AuthErrorMessage>{error}</AuthErrorMessage>}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="font-mono text-label-mono text-on-surface-variant uppercase"
            >
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              leadingIcon={<MaterialIcon name="person" className="text-lg" />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-mono text-label-mono text-on-surface-variant uppercase"
            >
              Work Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="john@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              leadingIcon={<MaterialIcon name="mail" className="text-lg" />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-mono text-label-mono text-on-surface-variant uppercase"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
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
          className="py-3 font-semibold shadow-glow-primary"
        >
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

      <AuthDivider />
      <GoogleAuthButton label="Sign up with Google" />

      <p className="text-center text-body-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary transition-colors hover:text-secondary hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
