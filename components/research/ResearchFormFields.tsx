import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface FieldLabelProps {
  htmlFor?: string;
  icon: string;
  children: ReactNode;
}

/**
 * Uppercase mono field label with leading Material icon.
 */
export function FieldLabel({ htmlFor, icon, children }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 font-mono text-label-mono tracking-wider text-on-surface uppercase"
    >
      <span className="material-symbols-outlined text-base text-primary" aria-hidden>
        {icon}
      </span>
      {children}
    </label>
  );
}

interface FieldErrorProps {
  id?: string;
  message?: string;
}

/**
 * Inline validation error styled with design-system error tokens.
 */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="text-body-sm text-error">
      {message}
    </p>
  );
}

interface FieldHintProps {
  children: ReactNode;
  className?: string;
}

/**
 * Helper copy beneath form controls.
 */
export function FieldHint({ children, className }: FieldHintProps) {
  return (
    <p className={cn("text-body-sm text-on-surface-variant/70", className)}>
      {children}
    </p>
  );
}
