"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Avatar } from "@/components/ui";
import { SidebarNavItem } from "@/components/ui/SidebarNavItem";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { CAMPAIGNS_ENABLED, CAMPAIGNS_SOON_MESSAGE } from "@/lib/config/features";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  disabledReason?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/research/new", label: "New Research", icon: "science" },
  { href: "/leads", label: "Leads", icon: "groups" },
  {
    href: "/campaigns",
    label: "Campaigns",
    icon: "send",
    disabledReason: CAMPAIGNS_ENABLED ? undefined : CAMPAIGNS_SOON_MESSAGE,
  },
  { href: "/settings", label: "Settings", icon: "settings" },
];

const ADMIN_ITEM: NavItem = { href: "/admin", label: "Admin", icon: "admin_panel_settings" };

const sidebarContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const sidebarItem = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

interface DashboardSidebarProps {
  isAdmin?: boolean;
  userEmail?: string | null;
  userName?: string | null;
  avatarUrl?: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarPanel({
  isAdmin,
  userEmail,
  userName,
  avatarUrl,
  onNavigate,
}: {
  isAdmin?: boolean;
  userEmail?: string | null;
  userName?: string | null;
  avatarUrl?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName =
    userName || userEmail?.split("@")[0] || "LeadScope User";

  return (
    <>
      <div className="mb-6 mt-2 px-2 md:mb-8">
        <h1 className="gradient-text text-[32px] leading-none font-bold tracking-tight">
          LeadScope AI
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">Enterprise Tier</p>
      </div>

      <motion.nav
        className="flex flex-1 flex-col gap-2"
        variants={sidebarContainer}
        initial="hidden"
        animate="show"
      >
        {(isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS).map((item) => {
          const active = !item.disabledReason &&
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <motion.div key={item.href} variants={sidebarItem}>
              <SidebarNavItem
                href={item.href}
                label={item.label}
                active={active}
                disabled={Boolean(item.disabledReason)}
                tooltip={item.disabledReason}
                badge={item.disabledReason ? "Soon" : undefined}
                onClick={onNavigate}
                icon={
                  <MaterialIcon
                    name={item.icon}
                    className={active ? "text-on-primary-container" : undefined}
                    filled={active}
                  />
                }
              />
            </motion.div>
          );
        })}
      </motion.nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar
            src={avatarUrl}
            alt={displayName}
            fallback={displayName.slice(0, 2).toUpperCase()}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-on-surface">
              {displayName}
            </p>
            <p className="truncate text-xs text-on-surface-variant">
              {userEmail ?? "Signed in"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-body-sm text-on-surface-variant transition-colors hover:border-primary/40 hover:bg-white/5 hover:text-on-surface"
        >
          <MaterialIcon name="logout" className="text-lg" />
          Log out
        </button>
      </div>
    </>
  );
}

/**
 * Fixed glass sidebar with staggered nav entrance and user profile footer.
 */
export function DashboardSidebar({
  isAdmin,
  userEmail,
  userName,
  avatarUrl,
  mobileOpen,
  onMobileClose,
}: DashboardSidebarProps) {
  return (
    <>
      <aside className="fixed top-gutter bottom-gutter left-gutter z-50 hidden w-64 flex-col gap-panel-gap rounded-xl border border-white/10 bg-surface-container/60 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl md:flex">
        <SidebarPanel
          isAdmin={isAdmin}
          userEmail={userEmail}
          userName={userName}
          avatarUrl={avatarUrl}
        />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-canvas/70 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onMobileClose}
        aria-hidden={!mobileOpen}
      />

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-[min(100vw-2rem,16rem)] flex-col gap-panel-gap border-r border-white/10 bg-surface-container/95 p-4 shadow-2xl backdrop-blur-panel transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarPanel
          isAdmin={isAdmin}
          userEmail={userEmail}
          userName={userName}
          avatarUrl={avatarUrl}
          onNavigate={onMobileClose}
        />
      </aside>
    </>
  );
}

/**
 * Mobile-only sidebar brand link shown when drawer is closed.
 */
export function DashboardMobileBrand() {
  return (
    <Link href="/dashboard" className="gradient-text text-base font-semibold md:hidden">
      LeadScope AI
    </Link>
  );
}
