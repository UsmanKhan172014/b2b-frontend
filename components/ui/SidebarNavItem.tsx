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
