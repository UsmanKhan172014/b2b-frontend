import { type ReactNode } from "react";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";

interface AuthMessageProps {
  children: ReactNode;
}

/**
 * Inline error alert styled with design-system error tokens.
 */
export function AuthErrorMessage({ children }: AuthMessageProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-body-sm text-error"
    >
      {children}
    </div>
  );
}

interface AuthDividerProps {
  label?: string;
}

/**
 * Horizontal divider with mono label (login/signup "Or" separator).
 */
export function AuthDivider({ label = "Or" }: AuthDividerProps) {
  return (
    <div className="relative flex items-center py-2">
      <div className="grow border-t border-white/10" />
      <span className="mx-4 shrink-0 font-mono text-label-mono text-on-surface-variant uppercase">
        {label}
      </span>
      <div className="grow border-t border-white/10" />
    </div>
  );
}

/**
 * Google sign-in button (visual parity with Stitch; OAuth wiring optional later).
 */
export function GoogleAuthButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-surface-container-lowest/50 py-3 text-body-base text-on-surface opacity-70 transition-all duration-300"
      title="Google sign-in coming soon"
    >
      <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {label}
    </button>
  );
}

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  variant?: "login" | "signup";
}

/**
 * Branded auth card header with icon and titles.
 */
export function AuthHeader({
  title,
  subtitle,
  variant = "login",
}: AuthHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <div
        className={
          variant === "login"
            ? "flex size-12 items-center justify-center rounded-xl bg-gradient-accent shadow-glow-primary"
            : "flex size-12 items-center justify-center rounded-xl border border-white/5 bg-surface-container shadow-lg"
        }
      >
        <MaterialIcon
          name="psychology"
          className={
            variant === "login"
              ? "text-xl text-canvas"
              : "text-[28px] text-primary"
          }
          filled
        />
      </div>
      <div>
        {variant === "login" && (
          <h1 className="mb-1 gradient-text text-display-lg-mobile md:text-display-lg">
            LeadScope AI
          </h1>
        )}
        <h2
          className={
            variant === "login"
              ? "text-headline-md text-on-surface"
              : "mb-2 text-headline-md tracking-tight text-on-surface"
          }
        >
          {title}
        </h2>
        {variant === "signup" && (
          <p className="text-body-sm text-on-surface-variant">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
