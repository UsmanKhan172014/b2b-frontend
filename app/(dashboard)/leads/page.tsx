import { redirect } from "next/navigation";

import { ResearchResultsView } from "@/components/research/ResearchResultsView";
import { mapLeadRowToResearchLead } from "@/lib/research/mapLeadRow";
import { getAllLeadsForUser } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const leadRows = await getAllLeadsForUser(supabase);
  const initialLeads = leadRows.map(mapLeadRowToResearchLead);

  return (
    <ResearchResultsView
      initialLeads={initialLeads}
      title="Lead Library"
      subtitle={
        initialLeads.length > 0
          ? `${initialLeads.length} leads saved across all research sessions`
          : "Run a research session to discover and save leads here."
      }
    />
  );
}
