import Link from "next/link";
import { redirect } from "next/navigation";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Badge, Button, GlassCard } from "@/components/ui";
import { CampaignSetupRequired } from "@/components/campaigns/CampaignSetupRequired";
import {
  getCampaignsForUser,
  getEmailTemplates,
} from "@/lib/campaigns/queries";
import type { CampaignListItem, CampaignStatus } from "@/lib/campaigns/types";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { getTemplateDisplayName } from "@/lib/email/templateCatalog";
import { createClient } from "@/lib/supabase/server";

function statusBadge(
  status: CampaignStatus,
): "primary" | "secondary" | "error" | "neutral" {
  switch (status) {
    case "completed":
      return "secondary";
    case "sending":
      return "primary";
    case "failed":
      return "error";
    default:
      return "neutral";
  }
}

export default async function CampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let campaigns: CampaignListItem[] = [];
  let setupError: string | null = null;
  let emailTemplates = [] as Awaited<ReturnType<typeof getEmailTemplates>>;

  try {
    [campaigns, emailTemplates] = await Promise.all([
      getCampaignsForUser(supabase),
      getEmailTemplates(supabase),
    ]);
  } catch (error) {
    setupError = formatSupabaseError(error).message;
  }

  return (
    <div className="mx-auto w-full max-w-container-max">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-display-lg-mobile tracking-tight text-on-surface md:text-display-lg">
            Campaigns
          </h1>
          <p className="mt-2 max-w-2xl text-body-base text-on-surface-variant">
            Launch AI-personalized outreach to your researched leads.
          </p>
        </div>
        {!setupError ? (
          <Link href="/campaigns/new">
            <Button size="md">
              <MaterialIcon name="add" className="text-lg" />
              New Campaign
            </Button>
          </Link>
        ) : null}
      </div>

      {setupError ? (
        <CampaignSetupRequired message={setupError} />
      ) : campaigns.length === 0 ? (
        <GlassCard radius="section" className="p-8 text-center">
          <MaterialIcon
            name="campaign"
            className="mx-auto mb-4 text-4xl text-on-surface-variant"
          />
          <p className="text-body-base text-on-surface">No campaigns yet.</p>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Run research, select leads, and launch your first outreach campaign.
          </p>
          <Link href="/campaigns/new" className="mt-6 inline-block">
            <Button>Create Campaign</Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <GlassCard
                radius="section"
                className="flex flex-col gap-4 p-6 transition-colors hover:bg-surface/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h2 className="text-headline-md text-on-surface">
                      {campaign.name}
                    </h2>
                    <Badge status={statusBadge(campaign.status)} glow>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    Template:{" "}
                    {getTemplateDisplayName(
                      campaign.templateSlug,
                      emailTemplates,
                    )}{" "}
                    · Created{" "}
                    {new Date(campaign.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
                <div className="text-body-sm text-on-surface-variant">
                  {campaign.sentCount}/{campaign.recipientCount} sent
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
