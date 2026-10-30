import { type HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/** Semantic status color for badge text and optional glow. */
export type BadgeStatus = "primary" | "secondary" | "tertiary" | "error" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status color driving text and optional glow. @default "neutral" */
  status?: BadgeStatus;
  /** Adds a box-shadow glow in the badge status color. */
  glow?: boolean;
}

const statusClasses: Record<BadgeStatus, string> = {
  primary: "border-primary/30 bg-primary/10 text-primary",
  secondary: "border-secondary/30 bg-secondary/10 text-secondary",
  tertiary: "border-tertiary/30 bg-tertiary/10 text-tertiary",
  error: "border-error/30 bg-error/10 text-error",
  neutral:
    "border-white/10 bg-surface-container text-on-surface-variant",
};

const glowClasses: Record<BadgeStatus, string> = {
  primary: "shadow-glow-primary-sm",
  secondary: "shadow-glow-secondary-sm",
  tertiary: "shadow-glow-tertiary-sm",
  error: "shadow-glow-error-sm",
  neutral: "",
};

/**
 * JetBrains Mono label chip for metadata and lead status indicators.
 */
export function Badge({
  status = "neutral",
  glow = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-3 py-1.5 font-mono text-label-mono uppercase",
        statusClasses[status],
        glow && glowClasses[status],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
