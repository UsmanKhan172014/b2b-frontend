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
 * Inline confirmation styled with design-system secondary tokens.
 */
export function AuthSuccessMessage({ children }: AuthMessageProps) {
  return (
    <div
      role="status"
      className="rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-body-sm text-on-surface"
    >
      {children}
    </div>
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
