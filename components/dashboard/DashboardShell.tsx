"use client";

import { type ReactNode, useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";

interface DashboardShellProps {
  children: ReactNode;
  userEmail?: string | null;
  userName?: string | null;
  avatarUrl?: string;
}

/**
 * Responsive dashboard chrome: sidebar, top bar, and scrollable main region.
 */
export function DashboardShell({
  children,
  userEmail,
  userName,
  avatarUrl,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden antialiased selection:bg-primary-container selection:text-on-primary-container">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] size-1/2 rounded-full bg-primary/10 blur-[120px] mix-blend-screen" />
        <div className="absolute right-[-10%] bottom-[-20%] size-[40%] rounded-full bg-secondary/5 blur-[100px] mix-blend-screen" />
      </div>

      <DashboardSidebar
        userEmail={userEmail}
        userName={userName}
        avatarUrl={avatarUrl}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col md:ml-[calc(256px+48px)]">
        <DashboardTopBar onMenuClick={() => setMobileNavOpen(true)} />

        <main className="mt-16 flex flex-1 flex-col p-4 pt-6 sm:p-6 md:p-margin-desktop md:pt-24">
          {children}
        </main>
      </div>
    </div>
  );
}
