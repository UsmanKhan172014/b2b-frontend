import { redirect } from "next/navigation";

import {
  DashboardEmptyState,
  DashboardRecentSessions,
  DashboardStatCards,
} from "@/components/dashboard/DashboardOverview";
import { getLeadCountsBySession, getResearchSessions } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sessions = await getResearchSessions(supabase, user.id);

  if (sessions.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-container-max flex-col gap-panel-gap">
        <div className="flex flex-1 items-center justify-center py-4 sm:min-h-[calc(100vh-12rem)] sm:py-8">
          <DashboardEmptyState />
        </div>
      </div>
    );
  }

  const activePipelines = sessions.filter((session) =>
    ["pending", "running"].includes(session.status),
  ).length;

  const leadCounts = await getLeadCountsBySession(
    supabase,
    sessions.map((session) => session.id),
  );

  const { data: leadRows, error: leadsError } = await supabase
    .from("leads")
    .select("confidence_score");

  if (leadsError) throw leadsError;

  const scores = (leadRows ?? [])
    .map((row) => Number(row.confidence_score))
    .filter((score) => !Number.isNaN(score));

  const totalLeads = scores.length;
  const avgConfidence =
    scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : null;

  return (
    <div className="mx-auto flex w-full max-w-container-max flex-col gap-panel-gap">
      <div className="mb-2">
        <h1 className="mb-1 text-display-lg-mobile tracking-tight text-on-surface md:text-display-lg">
          Command Center
        </h1>
        <p className="text-body-base text-on-surface-variant">
          Real-time overview of your pipeline and AI analysis.
        </p>
      </div>
      <DashboardStatCards
        metrics={[
          {
            label: "Active Pipelines",
            value: String(activePipelines),
            delta: `${sessions.length} total`,
            icon: "account_tree",
            href: activePipelines > 0 ? `/research/${sessions.find((s) => ["pending", "running"].includes(s.status))?.id}/progress` : undefined,
          },
          {
            label: "Verified Leads",
            value: String(totalLeads),
            delta: totalLeads > 0 ? "from research" : "—",
            icon: "verified_user",
            href: totalLeads > 0 ? "/leads" : undefined,
          },
          {
            label: "AI Confidence",
            value: avgConfidence !== null ? `${avgConfidence}%` : "—",
            icon: "speed",
          },
        ]}
      />
      <DashboardRecentSessions sessions={sessions} leadCounts={leadCounts} />
    </div>
  );
}
