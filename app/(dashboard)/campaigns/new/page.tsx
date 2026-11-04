import { CampaignBuilderView } from "@/components/campaigns/CampaignBuilderView";

interface NewCampaignPageProps {
  searchParams: Promise<{
    sessionId?: string;
    leadIds?: string;
  }>;
}

export default async function NewCampaignPage({ searchParams }: NewCampaignPageProps) {
  const params = await searchParams;
  const initialLeadIds =
    params.leadIds
      ?.split(",")
      .map((id) => id.trim())
      .filter(Boolean) ?? [];

  return (
    <CampaignBuilderView
      sessionId={params.sessionId}
      initialLeadIds={initialLeadIds}
    />
  );
}
