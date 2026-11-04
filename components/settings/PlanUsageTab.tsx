"use client";

import { useEffect, useState } from "react";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  getUserResearchUsage,
  limitMessage,
  PLAN_LABELS,
  type ResearchUsage,
} from "@/lib/research/usageLimits";
import { createClient } from "@/lib/supabase/client";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-0">
      <dt className="text-body-sm text-on-surface-variant">{label}</dt>
      <dd className="text-body-sm font-medium text-on-surface">{value}</dd>
    </div>
  );
}

/**
 * The person's plan and what is left of it. Numbers come from the database; this tab only displays them.
 */
export function PlanUsageTab() {
  const [usage, setUsage] = useState<ResearchUsage | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getUserResearchUsage(createClient())
      .then((value) => {
        if (!cancelled) setUsage(value);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <GlassCard radius="section" className="max-w-3xl p-6 sm:p-8">
        <p className="text-body-sm text-error">Your plan details could not be loaded. Please refresh the page.</p>
      </GlassCard>
    );
  }
  if (!usage) {
    return (
      <GlassCard radius="section" className="max-w-3xl p-6 sm:p-8">
        <p className="text-body-sm text-on-surface-variant">Loading your plan...</p>
      </GlassCard>
    );
  }

  const isDemo = usage.runLimit !== null;
  const used = isDemo ? usage.runsUsed : usage.monthlyUsed;
  const limit = isDemo ? usage.runLimit : usage.monthlyLimit;
  const percent = limit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const blocked = !usage.canStart;

  return (
    <GlassCard radius="section" className="max-w-3xl p-6 sm:p-8">
      <h3 className="mb-6 flex items-center gap-2 text-headline-md text-on-surface">
        <MaterialIcon name="workspace_premium" className="text-primary" />
        {PLAN_LABELS[usage.planType]} plan
      </h3>

      {limit !== null ? (
        <div className="mb-6">
          <div className="mb-2 flex items-baseline justify-between text-body-sm">
            <span className="text-on-surface-variant">
              {isDemo ? "Free runs used" : "Leads used"}
            </span>
            <span className="font-medium text-on-surface">
              {used} / {limit}
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={used}
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-label={isDemo ? "Free runs used" : "Leads used"}
          >
            <div
              className={cn("h-full rounded-full transition-all", percent >= 100 ? "bg-error" : "bg-primary")}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : null}

      {blocked ? (
        <p className="mb-6 flex items-start gap-2 rounded-lg border border-error/30 bg-error-container/10 px-4 py-3 text-body-sm text-error/90">
          <MaterialIcon name="block" className="mt-0.5 shrink-0 text-lg" />
          {limitMessage(usage)}
        </p>
      ) : null}

      <dl>
        <Row label="Plan" value={PLAN_LABELS[usage.planType]} />
        <Row label="Most leads in one run" value={String(usage.maxLeadsPerRun)} />
        {isDemo ? (
          <Row label="Free runs left" value={String(usage.runsRemaining ?? 0)} />
        ) : usage.monthlyLimit !== null ? (
          <>
            <Row label="Lead quota" value={String(usage.monthlyLimit)} />
            <Row label="Leads left" value={String(usage.monthlyRemaining ?? 0)} />
          </>
        ) : (
          <Row label="Lead quota" value="Unlimited" />
        )}
      </dl>

      <p className="mt-6 text-body-sm text-on-surface-variant/70">
        Only the leads a run actually delivers count. A run that finds nothing costs you nothing. Your quota does not renew
        automatically. To add more or change your plan, contact your administrator or support.
      </p>
    </GlassCard>
  );
}
