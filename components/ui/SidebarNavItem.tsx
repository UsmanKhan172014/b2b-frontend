import Link from "next/link";
import { type AnchorHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface SidebarNavItemProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Navigation label. */
  label: string;
  /** Leading icon (Material Symbol or SVG). */
  icon: ReactNode;
  /** Route target. Renders a Next.js `Link` when provided. */
  href?: string;
  /** Highlights the active route with primary-container fill. @default false */
  active?: boolean;
  /** Not clickable yet. Shows `tooltip` on hover and keyboard focus. @default false */
  disabled?: boolean;
  /** Explains why an item is disabled. */
  tooltip?: string;
  /** Small pill next to the label, e.g. "Soon". */
  badge?: string;
}

const baseClasses =
  "flex scale-95 items-center gap-3 rounded-lg px-4 py-3 text-body-base transition-all active:scale-90";

const inactiveClasses =
  "text-on-surface-variant hover:bg-white/5 hover:text-on-surface";

const activeClasses =
  "bg-primary-container font-bold text-on-primary-container shadow-glow-primary-sm";

/**
 * Sidebar navigation link matching dashboard and research-brief nav patterns.
 */
export function SidebarNavItem({
  label,
  icon,
  href,
  active = false,
  disabled = false,
  tooltip,
  badge,
  className,
  onClick,
  ...props
}: SidebarNavItemProps) {
  const classes = cn(
    baseClasses,
    active ? activeClasses : inactiveClasses,
    className,
  );

  const content = (
    <>
      <span
        className={cn(
          !active && "text-on-surface-variant group-hover:text-primary",
        )}
      >
        {icon}
      </span>
      <span>{label}</span>
    </>
  );

  if (disabled) {
    const tooltipId = tooltip ? `nav-tip-${label.toLowerCase().replace(/W+/g, "-")}` : undefined;
    return (
      <div className="group relative">
        <span
          role="link"
          aria-disabled="true"
          tabIndex={0}
          aria-describedby={tooltipId}
          className={cn(
            baseClasses,
            "cursor-not-allowed text-on-surface-variant/50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary/50",
          )}
        >
          <span>{icon}</span>
          <span className="flex-1">{label}</span>
          {badge ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] tracking-wider text-on-surface-variant uppercase">
              {badge}
            </span>
          ) : null}
        </span>
        {tooltip ? (
          <span
            id={tooltipId}
            role="tooltip"
            className="pointer-events-none absolute top-1/2 left-full z-[60] ml-3 w-56 -translate-y-1/2 rounded-lg border border-white/10 bg-surface-container-highest px-3 py-2 text-body-sm text-on-surface opacity-0 shadow-xl transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-md:top-full max-md:left-4 max-md:ml-0 max-md:mt-1 max-md:translate-y-0"
          >
            {tooltip}
          </span>
        ) : null}
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className={cn("group", classes)} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href="#"
      className={cn("group", classes)}
      onClick={onClick}
      {...props}
    >
      {content}
    </a>
  );
}
