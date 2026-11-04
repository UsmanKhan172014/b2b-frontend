"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button, GlassCard } from "@/components/ui";
import type { ResearchSessionRow } from "@/lib/queries";
import { cn } from "@/lib/cn";

const statsContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const statCard = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface StatMetric {
  label: string;
  value: string;
  delta?: string;
  icon: string;
  href?: string;
}

const PLACEHOLDER_STATS: StatMetric[] = [
  { label: "Active Pipelines", value: "0", delta: "—", icon: "account_tree" },
  { label: "Verified Leads", value: "0", delta: "—", icon: "verified_user" },
  { label: "AI Confidence", value: "—", icon: "speed" },
];

/**
 * Stat metric cards from the executive dashboard reference.
 */
export function DashboardStatCards({ metrics = PLACEHOLDER_STATS }: { metrics?: StatMetric[] }) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-panel-gap sm:grid-cols-2 xl:grid-cols-3"
      variants={statsContainer}
      initial="hidden"
      animate="show"
    >
      {metrics.map((metric) => {
        const card = (
          <GlassCard
            className={cn(
              "flex flex-col overflow-hidden rounded-xl p-5 sm:p-6",
              metric.href && "transition-colors hover:border-primary/30",
            )}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="font-mono text-label-mono tracking-widest text-on-surface-variant uppercase">
                {metric.label}
              </span>
              <MaterialIcon name={metric.icon} className="text-primary/70" />
            </div>
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <h2 className="text-display-lg-mobile text-on-surface md:text-display-lg">
                {metric.value}
              </h2>
              {metric.delta && (
                <span className="flex items-center font-mono text-label-mono text-secondary">
                  {metric.delta}
                </span>
              )}
            </div>
          </GlassCard>
        );

        return (
          <motion.div key={metric.label} variants={statCard}>
            {metric.href ? (
              <Link href={metric.href} className="block">
                {card}
              </Link>
            ) : (
              card
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/**
 * Empty state card when no research sessions exist (primary dashboard reference).
 */
export function DashboardEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      className="flex w-full justify-center"
    >
      <GlassCard
        glow
        className="flex w-full max-w-lg flex-col items-center rounded-2xl p-8 text-center transition-transform duration-500 hover:scale-[1.01] sm:p-12"
      >
        <div className="mb-6 flex size-20 items-center justify-center rounded-2xl border border-white/5 bg-surface-container-high/50 shadow-inner">
          <MaterialIcon
            name="troubleshoot"
            className="text-4xl text-secondary opacity-80"
          />
        </div>
        <h3 className="mb-3 text-headline-md tracking-tight text-on-surface">
          Start your first discovery
        </h3>
        <p className="mb-8 max-w-sm text-body-base leading-relaxed text-on-surface-variant sm:mb-10">
          No research sessions yet. Connect your criteria to find high-intent
          leads across the global network.
        </p>
        <Link href="/research/new" className="w-full">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="group justify-center shadow-xl shadow-primary/20"
          >
            <MaterialIcon
              name="rocket_launch"
              className="transition-transform duration-300 group-hover:rotate-12"
            />
            New Research Session
          </Button>
        </Link>
        <div className="mt-8 flex gap-2">
          <span className="size-1.5 rounded-full bg-primary/20" />
          <span className="size-1.5 rounded-full bg-primary/40" />
          <span className="size-1.5 rounded-full bg-primary/20" />
        </div>
      </GlassCard>
    </motion.div>
  );
}

const SESSION_STATUS_LABELS: Record<ResearchSessionRow["status"], string> = {
  pending: "Queued",
  running: "In progress",
  completed: "Completed",
  failed: "Failed",
};

function sessionHref(session: ResearchSessionRow): string {
  if (session.status === "running" || session.status === "pending") {
    return `/research/${session.id}/progress`;
  }
  return `/research/${session.id}/results`;
}

function briefSummary(brief: Record<string, unknown>): string {
  const industry = typeof brief.industry === "string" ? brief.industry : "Research";
  const signals =
    typeof brief.buyingSignals === "string"
      ? brief.buyingSignals
      : typeof brief.buying_signals === "string"
        ? brief.buying_signals
        : "";
  return signals ? `${industry} — ${signals.slice(0, 80)}` : industry;
}

interface DashboardRecentSessionsProps {
  sessions: ResearchSessionRow[];
  leadCounts: Record<string, number>;
}

/**
 * Recent research sessions with navigation to results or progress.
 */
export function DashboardRecentSessions({
  sessions,
  leadCounts,
}: DashboardRecentSessionsProps) {
  const recent = sessions.slice(0, 8);

  return (
    <GlassCard className="rounded-xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-headline-sm text-on-surface">Recent Research</h2>
        <Link
          href="/research/new"
          className="font-mono text-label-mono text-primary transition-colors hover:text-primary/80"
        >
          New session
        </Link>
      </div>

      <ul className="divide-y divide-white/5">
        {recent.map((session) => {
          const leadCount = leadCounts[session.id] ?? 0;
          const href = sessionHref(session);
          const isActive = session.status === "running" || session.status === "pending";

          return (
            <li key={session.id}>
              <Link
                href={href}
                className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-white/[0.02]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-medium text-on-surface">
                    {briefSummary(session.brief)}
                  </p>
                  <p className="mt-1 font-mono text-label-mono text-on-surface-variant">
                    {new Date(session.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                    {leadCount > 0 ? ` · ${leadCount} leads` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md border px-2.5 py-1 font-mono text-label-mono",
                    isActive
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : session.status === "failed"
                        ? "border-error/30 bg-error/10 text-error"
                        : "border-white/10 bg-surface-container text-on-surface-variant",
                  )}
                >
                  {SESSION_STATUS_LABELS[session.status]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
