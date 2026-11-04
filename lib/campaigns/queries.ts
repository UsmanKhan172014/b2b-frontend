import type { SupabaseClient } from "@supabase/supabase-js";

import type { EmailTemplate } from "@/lib/email/types";
import { throwSupabaseError } from "@/lib/supabase/errors";
import type {
  CampaignDraft,
  CampaignListItem,
  CampaignRecipientRow,
  CampaignRow,
} from "@/lib/campaigns/types";
import { mapCampaignRowToDraft } from "@/lib/campaigns/types";

export interface SaveCampaignInput {
  userId: string;
  draft: CampaignDraft;
}

export interface LaunchCampaignSummary {
  campaignId: string;
  sent: number;
  failed: number;
  skipped: number;
}

/**
 * Lists email templates available for campaigns.
 */
export async function getEmailTemplates(
  supabase: SupabaseClient,
): Promise<EmailTemplate[]> {
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .order("name", { ascending: true });

  if (error) throwSupabaseError(error);
  return (data ?? []) as EmailTemplate[];
}

/**
 * Returns a single email template by slug.
 */
export async function getEmailTemplateBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<EmailTemplate | null> {
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throwSupabaseError(error);
  return (data as EmailTemplate | null) ?? null;
}

/**
 * Creates or updates a campaign draft.
 */
export async function saveCampaign(
  supabase: SupabaseClient,
  input: SaveCampaignInput,
): Promise<CampaignDraft> {
  const { draft, userId } = input;
  const payload = {
    user_id: userId,
    name: draft.name,
    objective: draft.objective,
    tone: draft.tone,
    template_slug: draft.templateSlug,
    status: draft.status ?? "draft",
    source_session_id: draft.sourceSessionId,
    selected_lead_ids: draft.selectedLeadIds,
    channels: draft.channels,
    email_steps: draft.emailSteps,
  };

  if (draft.id) {
    const { data, error } = await supabase
      .from("campaigns")
      .update(payload)
      .eq("id", draft.id)
      .select("*")
      .single();

    if (error) throwSupabaseError(error);
    return mapCampaignRowToDraft(data as CampaignRow);
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert(payload)
    .select("*")
    .single();

  if (error) throwSupabaseError(error);
  return mapCampaignRowToDraft(data as CampaignRow);
}

/**
 * Loads a campaign by id (RLS-scoped).
 */
export async function getCampaign(
  supabase: SupabaseClient,
  campaignId: string,
): Promise<CampaignDraft> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (error) throwSupabaseError(error);
  return mapCampaignRowToDraft(data as CampaignRow);
}

/**
 * Lists campaigns for the authenticated user with recipient counts.
 */
export async function getCampaignsForUser(
  supabase: SupabaseClient,
): Promise<CampaignListItem[]> {
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throwSupabaseError(error);

  const campaignRows = (campaigns ?? []) as CampaignRow[];
  if (campaignRows.length === 0) return [];

  const campaignIds = campaignRows.map((row) => row.id);
  const { data: recipients, error: recipientsError } = await supabase
    .from("campaign_recipients")
    .select("campaign_id, status")
    .in("campaign_id", campaignIds);

  if (recipientsError) throw recipientsError;

  const counts: Record<string, { total: number; sent: number }> = {};
  for (const row of recipients ?? []) {
    const campaignId = String(row.campaign_id);
    counts[campaignId] ??= { total: 0, sent: 0 };
    counts[campaignId].total += 1;
    if (row.status === "sent") counts[campaignId].sent += 1;
  }

  return campaignRows.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    templateSlug: row.template_slug,
    recipientCount: counts[row.id]?.total ?? row.selected_lead_ids.length,
    sentCount: counts[row.id]?.sent ?? 0,
    createdAt: row.created_at,
    launchedAt: row.launched_at,
  }));
}

/**
 * Returns recipients for a campaign.
 */
export async function getCampaignRecipients(
  supabase: SupabaseClient,
  campaignId: string,
): Promise<CampaignRecipientRow[]> {
  const { data, error } = await supabase
    .from("campaign_recipients")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: true });

  if (error) throwSupabaseError(error);
  return (data ?? []) as CampaignRecipientRow[];
}

/**
 * Updates campaign status.
 */
export async function updateCampaignStatus(
  supabase: SupabaseClient,
  campaignId: string,
  status: CampaignRow["status"],
  launchedAt?: string | null,
): Promise<void> {
  const payload: Record<string, unknown> = { status };
  if (launchedAt !== undefined) {
    payload.launched_at = launchedAt;
  }

  const { error } = await supabase.from("campaigns").update(payload).eq("id", campaignId);
  if (error) throwSupabaseError(error);
}

/**
 * Inserts campaign recipient rows.
 */
export async function insertCampaignRecipients(
  supabase: SupabaseClient,
  rows: Array<{
    campaign_id: string;
    lead_id: string | null;
    recipient_email: string;
    variables: Record<string, string>;
    status?: CampaignRecipientRow["status"];
    error?: string | null;
  }>,
): Promise<CampaignRecipientRow[]> {
  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from("campaign_recipients")
    .insert(rows)
    .select("*");

  if (error) throwSupabaseError(error);
  return (data ?? []) as CampaignRecipientRow[];
}

/**
 * Updates a single campaign recipient after send attempt.
 */
export async function updateCampaignRecipient(
  supabase: SupabaseClient,
  recipientId: string,
  update: Partial<
    Pick<CampaignRecipientRow, "status" | "message_id" | "error" | "sent_at">
  >,
): Promise<void> {
  const { error } = await supabase
    .from("campaign_recipients")
    .update(update)
    .eq("id", recipientId);

  if (error) throwSupabaseError(error);
}
