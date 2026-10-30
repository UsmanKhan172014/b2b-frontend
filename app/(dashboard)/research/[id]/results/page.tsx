import { notFound, redirect } from "next/navigation";

import { ResearchResultsView } from "@/components/research/ResearchResultsView";
import { mapLeadRowToResearchLead } from "@/lib/research/mapLeadRow";
import { getLeadsForSession, getResearchSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

interface ResearchResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResearchResultsPage({
  params,
}: ResearchResultsPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let session;
  try {
    session = await getResearchSession(supabase, id);
  } catch {
    notFound();
  }

  if (session.status === "running" || session.status === "pending") {
    redirect(`/research/${id}/progress`);
  }

  const leadRows = await getLeadsForSession(supabase, id);
  const initialLeads = leadRows.map(mapLeadRowToResearchLead);

  const pipelineMetadata = session.pipeline_metadata ?? {};
  const costEstimate =
    pipelineMetadata.cost_estimate &&
    typeof pipelineMetadata.cost_estimate === "object"
      ? (pipelineMetadata.cost_estimate as Record<string, unknown>)
      : null;
  const estimatedCostUsd =
    typeof costEstimate?.estimated_cost_usd === "number"
      ? costEstimate.estimated_cost_usd
      : null;
  const costNote =
    typeof costEstimate?.cost_note === "string" ? costEstimate.cost_note : null;

  return (
    <ResearchResultsView
      sessionId={id}
      initialLeads={initialLeads}
      estimatedCostUsd={estimatedCostUsd}
      costNote={costNote}
    />
  );
}
