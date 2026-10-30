"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui";
import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
];

/**
 * Responsive marketing navigation with mobile drawer.
 */
export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-surface/40 px-margin-mobile backdrop-blur-md md:px-margin-desktop">
        <Link href="/" className="flex items-center gap-2">
          <MaterialIcon name="psychology" className="text-primary" filled />
          <span className="gradient-text text-base font-semibold sm:text-headline-md">
            LeadScope AI
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-body-sm text-on-surface-variant transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-transparent px-4 py-2 text-body-sm font-bold text-on-surface transition-all duration-200 hover:border-primary/50 hover:bg-white/5 hover:shadow-glow-primary-sm lg:px-5"
          >
            Sign In
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm" className="shadow-glow-primary">
              Start Free Trial
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((prev) => !prev)}
        >
          <MaterialIcon name={open ? "close" : "menu"} />
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-x-0 top-16 z-30 border-b border-white/10 bg-surface-container/95 px-margin-mobile py-4 backdrop-blur-panel transition-all duration-300 md:hidden",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-body-sm text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="rounded-lg border border-white/10 px-3 py-2.5 text-center text-body-sm font-semibold text-on-surface"
            onClick={() => setOpen(false)}
          >
            Sign In
          </Link>
          <Link href="/signup" onClick={() => setOpen(false)}>
            <Button variant="primary" fullWidth className="shadow-glow-primary">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
