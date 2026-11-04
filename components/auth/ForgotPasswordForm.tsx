"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthErrorMessage, AuthHeader, AuthSuccessMessage } from "@/components/auth/AuthShared";
import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button, Input } from "@/components/ui";

/**
 * Asks for the account e-mail and requests a reset link. The reply is the same for every address.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setSent(true);
      } else if (response.status === 429) {
        setError("Too many requests. Please try again in a few minutes.");
      } else if (response.status === 400) {
        setError("Enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Reset your password"
        subtitle="Enter your account email and we will send you a link to choose a new password."
        variant="signup"
      />

      {sent ? (
        <div className="flex flex-col gap-5">
          <AuthSuccessMessage>
            If an account exists for <strong>{email.trim()}</strong>, a reset link is on its way. It can take a
            few minutes, and it expires soon, so use it promptly.
          </AuthSuccessMessage>
          <p className="text-center text-body-sm text-on-surface-variant">
            Nothing arrived? Check your spam folder, or{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setSent(false)}
            >
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {error ? <AuthErrorMessage>{error}</AuthErrorMessage> : null}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-mono text-label-mono text-on-surface-variant uppercase"
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

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading || email.trim().length === 0}
            className="py-3 font-semibold shadow-glow-primary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <MaterialIcon name="progress_activity" className="animate-spin text-sm" />
                Sending...
              </span>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}

      <p className="text-center text-body-sm text-on-surface-variant">
        <Link
          href="/login"
          className="text-primary transition-colors hover:text-secondary hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
