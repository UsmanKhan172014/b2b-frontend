import { type InputHTMLAttributes, forwardRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional icon rendered inside the field on the left (login pattern). */
  leadingIcon?: ReactNode;
}

const fieldClasses =
  "w-full rounded-lg border border-white/10 bg-surface-container-lowest px-4 py-3 font-sans text-body-base text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50";

/**
 * Dark recessed text field with primary indigo focus ring and outer glow.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leadingIcon, ...props },
  ref,
) {
  if (leadingIcon) {
    return (
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-on-surface-variant/50">
          {leadingIcon}
        </span>
        <input
          ref={ref}
          className={cn(fieldClasses, "pl-10", className)}
          {...props}
        />
      </div>
    );
  }

  return (
    <input ref={ref} className={cn(fieldClasses, className)} {...props} />
  );
});
