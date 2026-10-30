"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button } from "@/components/ui";

interface DashboardTopBarProps {
  title?: string;
  onMenuClick: () => void;
}

/**
 * Fixed top navigation bar with mobile menu trigger and primary CTA.
 */
export function DashboardTopBar({
  title = "Overview",
  onMenuClick,
}: DashboardTopBarProps) {
  const pathname = usePathname();
  const isNewResearch = pathname === "/research/new";
  const isResearchProgress = /^\/research\/[^/]+\/progress$/.test(pathname);
  const isResearchResults = /^\/research\/[^/]+\/results$/.test(pathname);
  const isSettings = pathname === "/settings";
  const isCampaignBuilder = pathname === "/campaigns/new";

  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-surface/40 px-margin-mobile backdrop-blur-md md:left-[calc(256px+48px)] md:px-margin-desktop">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-on-surface-variant transition-all hover:bg-white/5 hover:text-primary md:hidden"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
        >
          <MaterialIcon name="menu" />
        </button>
        {isResearchProgress ? (
          <span className="flex min-w-0 items-center gap-1.5 truncate text-body-sm text-on-surface-variant sm:gap-2">
            <span className="hidden sm:inline">Lead Finder</span>
            <span className="sm:hidden">Finder</span>
            <MaterialIcon name="chevron_right" className="text-sm" />
            <span className="truncate font-medium text-primary">
              Live Progress
            </span>
          </span>
        ) : isResearchResults ? (
          <span className="flex min-w-0 items-center gap-1.5 truncate text-body-sm text-on-surface-variant sm:gap-2">
            <span className="hidden sm:inline">Lead Finder</span>
            <span className="sm:hidden">Finder</span>
            <MaterialIcon name="chevron_right" className="text-sm" />
            <span className="truncate font-medium text-primary">
              Results
            </span>
          </span>
        ) : isNewResearch ? (
          <span className="flex min-w-0 items-center gap-1.5 truncate text-body-sm text-on-surface-variant sm:gap-2">
            <span className="hidden sm:inline">Lead Finder</span>
            <span className="sm:hidden">Finder</span>
            <MaterialIcon name="chevron_right" className="text-sm" />
            <span className="truncate font-medium text-primary">
              New Research Brief
            </span>
          </span>
        ) : isSettings ? (
          <h2 className="truncate text-headline-md text-on-surface">Settings</h2>
        ) : isCampaignBuilder ? (
          <span className="flex min-w-0 items-center gap-1.5 truncate text-body-sm text-on-surface-variant sm:gap-2">
            <span>Campaigns</span>
            <MaterialIcon name="chevron_right" className="text-sm" />
            <span className="truncate font-medium text-primary">
              New Campaign Builder
            </span>
          </span>
        ) : (
          <h2 className="truncate text-headline-md text-on-surface">{title}</h2>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          className="hidden rounded-full p-2 text-on-surface-variant transition-all hover:bg-white/5 hover:text-primary sm:inline-flex"
          aria-label="Notifications"
        >
          <MaterialIcon name="notifications" />
        </button>
        <button
          type="button"
          className="hidden rounded-full p-2 text-on-surface-variant transition-all hover:bg-white/5 hover:text-primary sm:inline-flex"
          aria-label="Help"
        >
          <MaterialIcon name="help_outline" />
        </button>
        <Link href="/research/new">
          <Button
            variant="primary"
            size="sm"
            className="shadow-lg shadow-primary-container/20"
          >
            <MaterialIcon name="add" className="text-lg" />
            <span className="hidden sm:inline">New Research</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
