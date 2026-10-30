"use client";

import { type ReactNode } from "react";

/**
 * Centered auth page shell with ambient glow background.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden px-margin-mobile py-10 font-sans text-on-surface sm:py-12">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 size-[min(60vw,800px)] max-h-[800px] max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 opacity-70 mix-blend-screen blur-[100px]" />
        <div className="absolute top-0 right-0 size-[min(40vw,480px)] rounded-full bg-secondary/5 opacity-50 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
