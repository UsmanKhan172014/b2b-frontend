import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/cn";

/** Visual style variant aligned with DESIGN.md button rules. */
export type ButtonVariant = "primary" | "secondary" | "ghost";

/** Size scale using 8px rhythm and DESIGN.md small-component radii. */
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Primary uses Indigo→Cyan gradient; secondary/ghost are transparent with border. */
  variant?: ButtonVariant;
  /** Padding and type scale. @default "md" */
  size?: ButtonSize;
  /** Stretch to full container width. */
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-gradient-cta text-white shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-[0.98]",
  secondary:
    "border border-white/10 bg-surface-container-lowest/50 text-on-surface hover:bg-white/5 hover:border-primary/50 hover:shadow-glow-primary-sm",
  ghost:
    "border border-white/10 bg-transparent text-on-surface hover:bg-white/5 hover:border-primary/50 hover:shadow-glow-primary-sm",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "gap-2 rounded-lg px-5 py-2 text-body-sm font-bold",
  md: "gap-2 rounded-lg px-5 py-2.5 text-body-sm font-bold",
  lg: "gap-3 rounded-xl px-8 py-4 text-body-base font-bold shadow-xl shadow-primary/20",
};

/**
 * Action button with Luminous Intelligence gradient and ghost treatments.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      className,
      type = "button",
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-200",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
