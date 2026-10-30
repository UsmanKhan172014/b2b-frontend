import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Glass panel elevation per DESIGN.md depth scale. */
export type GlassCardElevation = 1 | 2;

/** Corner radius scale per DESIGN.md shapes. */
export type GlassCardRadius = "container" | "section";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content. */
  children: ReactNode;
  /**
   * Level 1: frosted glass panel (12px blur, 10% white border).
   * Level 2: elevated popover/modal surface with diffuse shadow.
   * @default 1
   */
  elevation?: GlassCardElevation;
  /**
   * `container` — 16px (`rounded-lg`) standard panels.
   * `section` — 24px (`rounded-xl`) large sections and modals.
   * @default "container"
   */
  radius?: GlassCardRadius;
  /** Adds a subtle primary-tint glow (empty-state cards). */
  glow?: boolean;
}

const radiusClasses: Record<GlassCardRadius, string> = {
  container: "rounded-lg",
  section: "rounded-xl",
};

/**
 * Frosted glass panel used across the Luminous Intelligence system.
 * Implements DESIGN.md Level 1 (Panels) and Level 2 (Popovers/Modals) specs.
 */
export function GlassCard({
  children,
  className,
  elevation = 1,
  radius = "container",
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "border border-white/10 bg-surface-container/40 backdrop-blur-glass",
        radiusClasses[radius],
        elevation === 2 &&
          "border-white/15 bg-surface-container-highest/60 shadow-elevated backdrop-blur-panel",
        glow && "shadow-glow-primary-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Thin horizontal divider for card headers (10% opacity).
 */
export function GlassCardDivider({
  className,
  ...props
}: HTMLAttributes<HTMLHRElement>) {
  return (
    <hr className={cn("border-t border-white/10", className)} {...props} />
  );
}
