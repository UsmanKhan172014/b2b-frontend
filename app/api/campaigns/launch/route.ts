import { NextResponse } from "next/server";

import { CAMPAIGNS_ENABLED, CAMPAIGNS_SOON_MESSAGE } from "@/lib/config/features";
import { logServerError } from "@/lib/security/http";
import {
  mapLeadToEmailVariables,
  resolveRecipientEmail,
} from "@/lib/campaigns/mapLeadToEmailVariables";
import {
  getEmailTemplateBySlug,
  insertCampaignRecipients,
  saveCampaign,
  updateCampaignRecipient,
  updateCampaignStatus,
} from "@/lib/campaigns/queries";
import type { CampaignDraft } from "@/lib/campaigns/types";
import { sendDynamicEmail } from "@/lib/email/sendDynamicEmail";
import { getLeadsForSession, getResearchSession } from "@/lib/queries";
import type { LeadRow } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

interface LaunchCampaignPayload {
  draft: CampaignDraft;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadLeadsForDraft(
  authClient: Awaited<ReturnType<typeof createClient>>,
  draft: CampaignDraft,
): Promise<LeadRow[]> {
  const selectedIds = new Set(draft.selectedLeadIds);

  if (draft.sourceSessionId) {
    const sessionLeads = await getLeadsForSession(authClient, draft.sourceSessionId);
    if (selectedIds.size > 0) {
      return sessionLeads.filter((lead) => selectedIds.has(lead.id));
    }
    return sessionLeads;
  }

  const { data, error } = await authClient
    .from("leads")
    .select("*")
    .in("id", draft.selectedLeadIds);

  if (error) throw error;
  return (data ?? []) as LeadRow[];
}

export async function POST(req: Request) {
  if (!CAMPAIGNS_ENABLED) {
    return NextResponse.json({ error: CAMPAIGNS_SOON_MESSAGE }, { status: 403 });
  }
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<LaunchCampaignPayload>;
    if (!body.draft) {
      return NextResponse.json({ error: "Missing campaign draft." }, { status: 400 });
    }

    const draft = body.draft;

    if (draft.selectedLeadIds.length === 0) {
      return NextResponse.json(
        { error: "Select at least one lead with an email address." },
        { status: 400 },
      );
    }

    if (!draft.channels.email) {
      return NextResponse.json(
        { error: "Enable the email channel before launching." },
        { status: 400 },
      );
    }

    const savedDraft = await saveCampaign(authClient, {
      userId: user.id,
      draft: { ...draft, status: "sending" },
    });

    const template = await getEmailTemplateBySlug(authClient, savedDraft.templateSlug);
    if (!template) {
      await updateCampaignStatus(authClient, savedDraft.id, "failed");
      return NextResponse.json({ error: "Email template not found." }, { status: 404 });
    }

    let offer = "";
    if (savedDraft.sourceSessionId) {
      try {
        const session = await getResearchSession(authClient, savedDraft.sourceSessionId);
        const brief = session.brief ?? {};
        offer = typeof brief.offer === "string" ? brief.offer : "";
      } catch {
        offer = "";
      }
    }

    const leads = await loadLeadsForDraft(authClient, savedDraft);
    const launchedAt = new Date().toISOString();
    await updateCampaignStatus(authClient, savedDraft.id, "sending", launchedAt);

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    const recipientRows: Array<{
      campaign_id: string;
      lead_id: string;
      recipient_email: string;
      variables: Record<string, string>;
      status: "pending" | "skipped";
      error?: string;
    }> = [];

    for (const lead of leads) {
      const recipientEmail = resolveRecipientEmail(lead);
      if (!recipientEmail) {
        skipped += 1;
        recipientRows.push({
          campaign_id: savedDraft.id,
          lead_id: lead.id,
          recipient_email: "",
          variables: {},
          status: "skipped",
          error: "No contact or company email available",
        });
        continue;
      }

      recipientRows.push({
        campaign_id: savedDraft.id,
        lead_id: lead.id,
        recipient_email: recipientEmail,
        variables: mapLeadToEmailVariables(lead, offer),
        status: "pending",
      });
    }

    const insertedRecipients = await insertCampaignRecipients(authClient, recipientRows);

    for (const recipient of insertedRecipients) {
      if (recipient.status === "skipped") {
        continue;
      }

      try {
        const result = await sendDynamicEmail(
          template,
          recipient.recipient_email,
          recipient.variables as Record<string, string>,
        );

        await updateCampaignRecipient(authClient, recipient.id, {
          status: "sent",
          message_id: result.messageId,
          sent_at: new Date().toISOString(),
          error: null,
        });
        sent += 1;
      } catch (sendError) {
        const message =
          sendError instanceof Error ? sendError.message : "Failed to send email";
        await updateCampaignRecipient(authClient, recipient.id, {
          status: "failed",
          error: message,
        });
        failed += 1;
      }

      await sleep(1000);
    }

    const finalStatus = sent > 0 ? "completed" : "failed";
    await updateCampaignStatus(authClient, savedDraft.id, finalStatus, launchedAt);

    return NextResponse.json({
      success: true,
      campaignId: savedDraft.id,
      sent,
      failed,
      skipped,
    });
  } catch (error: unknown) {
    logServerError("campaign-launch", error);
    return NextResponse.json({ error: "Could not launch the campaign." }, { status: 500 });
  }
}
