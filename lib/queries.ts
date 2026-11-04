import type { SupabaseClient } from "@supabase/supabase-js";

import {
  assertCanStartResearch,
  getUserResearchUsage,
  isResearchLimitError,
  limitMessage,
  ResearchLimitReachedError,
} from "@/lib/research/usageLimits";

export type ResearchSessionStatus = "pending" | "running" | "completed" | "failed";

export interface ResearchSessionRow {
  id: string;
  user_id: string;
  brief: Record<string, unknown>;
  status: ResearchSessionStatus;
  interaction_id?: string | null;
  research_report?: string | null;
  pipeline_metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface LeadRow {
  id: string;
  session_id: string;
  company_name: string;
  website: string;
  industry: string;
  size_estimate: string;
  region: string | null;
  signal: string | null;
  confidence_score: number | null;
  source_urls: string[] | null;
  contact_name?: string | null;
  contact_title?: string | null;
  contact_linkedin?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  contact_confidence?: string | null;
  rationale?: string | null;
  contact_page_url?: string | null;
  contact_type?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  email_source_url?: string | null;
  phone_source_url?: string | null;
  resolution_channel?: string | null;
  company_group_id?: string | null;
  is_primary_contact?: boolean | null;
  contact_rank?: number | null;
  linkedin_status?: string | null;
  linkedin_about?: string | null;
  linkedin_subtitle?: string | null;
  linkedin_location?: string | null;
  linkedin_experience?: unknown;
  linkedin_education?: unknown;
  linkedin_skills?: unknown;
  created_at: string;
}

export interface InsertLeadInput {
  company_name: string;
  website: string;
  industry: string;
  size_estimate: string;
  region?: string | null;
  signal?: string | null;
  confidence_score?: number | null;
  source_urls?: string[] | null;
  contact_name?: string | null;
  contact_title?: string | null;
  contact_linkedin?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  contact_confidence?: string | null;
  rationale?: string | null;
  contact_page_url?: string | null;
  contact_type?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  email_source_url?: string | null;
  phone_source_url?: string | null;
  resolution_channel?: string | null;
  company_group_id?: string | null;
  is_primary_contact?: boolean | null;
  contact_rank?: number | null;
  linkedin_status?: string | null;
  linkedin_about?: string | null;
  linkedin_subtitle?: string | null;
  linkedin_location?: string | null;
  linkedin_experience?: unknown;
  linkedin_education?: unknown;
  linkedin_skills?: unknown;
}

export interface CreateResearchSessionInput {
  userId: string;
  brief: Record<string, unknown>;
  status?: ResearchSessionStatus;
}

/**
 * Creates a research session owned by the authenticated user.
 */
export async function createResearchSession(
  supabase: SupabaseClient,
  input: CreateResearchSessionInput,
): Promise<ResearchSessionRow> {
  await assertCanStartResearch(supabase);

  const { data, error } = await supabase
    .from("research_sessions")
    .insert({
      user_id: input.userId,
      brief: input.brief,
      status: input.status ?? "pending",
    })
    .select("*")
    .single();

  if (error) {
    if (isResearchLimitError(error)) {
      const usage = await getUserResearchUsage(supabase);
      throw new ResearchLimitReachedError(limitMessage(usage), usage.blockedReason);
    }
    throw error;
  }
  return data as ResearchSessionRow;
}

/**
 * Lists research sessions for a user, newest first.
 */
export async function getResearchSessions(
  supabase: SupabaseClient,
  userId: string,
): Promise<ResearchSessionRow[]> {
  const { data, error } = await supabase
    .from("research_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ResearchSessionRow[];
}

/**
 * Returns leads for a session. RLS ensures the session belongs to the caller.
 */
export async function getLeadsForSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<LeadRow[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("session_id", sessionId)
    .order("confidence_score", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []) as LeadRow[];
}

/**
 * Returns all leads for the authenticated user (RLS-scoped), newest sessions first.
 */
export async function getAllLeadsForUser(
  supabase: SupabaseClient,
): Promise<LeadRow[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("confidence_score", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []) as LeadRow[];
}

/**
 * Company names this user already received in other research sessions (RLS-scoped to the caller). A new run skips
 * them so a subscription never delivers the same company twice.
 */
export async function getPreviouslyDeliveredCompanies(
  supabase: SupabaseClient,
  currentSessionId: string,
  limit = 5000,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("company_name")
    .neq("session_id", currentSessionId)
    .limit(limit);

  if (error) throw error;
  const names = new Map<string, string>();
  for (const row of data ?? []) {
    const name = String(row.company_name ?? "").trim();
    if (name && !names.has(name.toLowerCase())) names.set(name.toLowerCase(), name);
  }
  return [...names.values()];
}

/**
 * Counts leads per research session id.
 */
export async function getLeadCountsBySession(
  supabase: SupabaseClient,
  sessionIds: string[],
): Promise<Record<string, number>> {
  if (sessionIds.length === 0) return {};

  const { data, error } = await supabase
    .from("leads")
    .select("session_id")
    .in("session_id", sessionIds);

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const sessionId = String(row.session_id);
    counts[sessionId] = (counts[sessionId] ?? 0) + 1;
  }
  return counts;
}

/**
 * Returns a research session by id. RLS ensures the session belongs to the caller.
 */
export async function getResearchSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<ResearchSessionRow> {
  const { data, error } = await supabase
    .from("research_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) throw error;
  return data as ResearchSessionRow;
}

/**
 * Updates research session status.
 */
export async function updateResearchSessionStatus(
  supabase: SupabaseClient,
  sessionId: string,
  status: ResearchSessionStatus,
): Promise<void> {
  const { error } = await supabase
    .from("research_sessions")
    .update({ status })
    .eq("id", sessionId);

  if (error) throw error;
}

/**
 * Replaces all leads for a session (idempotent persist after stream completion).
 */
export async function replaceLeadsForSession(
  supabase: SupabaseClient,
  sessionId: string,
  leads: InsertLeadInput[],
): Promise<LeadRow[]> {
  const { error: deleteError } = await supabase
    .from("leads")
    .delete()
    .eq("session_id", sessionId);

  if (deleteError) throw formatSupabaseError(deleteError);
  return insertLeads(supabase, sessionId, leads);
}

function formatSupabaseError(error: unknown): Error {
  if (error instanceof Error && error.message && error.message !== "[object Object]") {
    return error;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const parts = [
      typeof record.message === "string" ? record.message : null,
      typeof record.details === "string" ? record.details : null,
      typeof record.hint === "string" ? record.hint : null,
      typeof record.code === "string" ? `code=${record.code}` : null,
    ].filter(Boolean);

    if (parts.length > 0) {
      return new Error(parts.join(" | "));
    }
  }

  return new Error(
    typeof error === "string" ? error : "Unknown Supabase error while saving leads",
  );
}

function isMissingContactColumnError(error: unknown): boolean {
  const message = formatSupabaseError(error).message.toLowerCase();
  return (
    message.includes("contact_name") ||
    message.includes("contact_title") ||
    message.includes("contact_linkedin") ||
    message.includes("contact_email") ||
    message.includes("contact_phone") ||
    message.includes("contact_whatsapp") ||
    message.includes("contact_confidence") ||
    message.includes("rationale") ||
    message.includes("contact_page_url") ||
    message.includes("contact_type") ||
    message.includes("company_email") ||
    message.includes("company_phone") ||
    message.includes("email_source_url") ||
    message.includes("phone_source_url") ||
    message.includes("resolution_channel") ||
    message.includes("company_group_id") ||
    message.includes("is_primary_contact") ||
    message.includes("contact_rank") ||
    message.includes("linkedin_status") ||
    (message.includes("schema cache") && message.includes("contact"))
  );
}

/**
 * Postgres text columns cannot store the NUL character (\u0000) - inserting it
 * fails with code 22P05 ("unsupported Unicode escape sequence"). Scraped web
 * content and LLM output occasionally contain stray NUL/control bytes, so we
 * strip them (and other non-printable C0 control chars, keeping \n\r\t) from
 * every string value - recursively, since arrays like source_urls also hold strings.
 */
function stripInvalidPgChars<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "") as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripInvalidPgChars(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        stripInvalidPgChars(v),
      ]),
    ) as unknown as T;
  }
  return value;
}

/**
 * Bulk-inserts leads for a session. RLS ensures the session belongs to the caller.
 * Requires migrations 003_person_first_contacts.sql and 004_contact_provenance.sql.
 */
export async function insertLeads(
  supabase: SupabaseClient,
  sessionId: string,
  leads: InsertLeadInput[],
): Promise<LeadRow[]> {
  if (leads.length === 0) return [];

  leads = stripInvalidPgChars(leads);

  const baseRows = leads.map((lead) => ({
    session_id: sessionId,
    company_name: lead.company_name,
    website: lead.website ?? "",
    industry: lead.industry ?? "",
    size_estimate: lead.size_estimate ?? "",
    region: lead.region ?? null,
    signal: lead.signal ?? null,
    confidence_score: lead.confidence_score ?? null,
    source_urls: lead.source_urls ?? [],
  }));

  const rowsWithContacts = baseRows.map((row, index) => ({
    ...row,
    contact_name: leads[index]?.contact_name ?? null,
    contact_title: leads[index]?.contact_title ?? null,
    contact_linkedin: leads[index]?.contact_linkedin ?? null,
    contact_email: leads[index]?.contact_email ?? null,
    contact_phone: leads[index]?.contact_phone ?? null,
    contact_whatsapp: leads[index]?.contact_whatsapp ?? null,
    contact_confidence: leads[index]?.contact_confidence ?? null,
    rationale: leads[index]?.rationale ?? null,
    contact_page_url: leads[index]?.contact_page_url ?? null,
    contact_type: leads[index]?.contact_type ?? null,
    company_email: leads[index]?.company_email ?? null,
    company_phone: leads[index]?.company_phone ?? null,
    email_source_url: leads[index]?.email_source_url ?? null,
    phone_source_url: leads[index]?.phone_source_url ?? null,
    resolution_channel: leads[index]?.resolution_channel ?? null,
    company_group_id:
      leads[index]?.company_group_id ??
      (leads[index]?.company_name ?? "").trim().toLowerCase() ??
      null,
    is_primary_contact: leads[index]?.is_primary_contact ?? true,
    contact_rank: leads[index]?.contact_rank ?? 1,
    linkedin_status: leads[index]?.linkedin_status ?? null,
  }));

  const firstAttempt = await supabase
    .from("leads")
    .insert(rowsWithContacts)
    .select("*");

  if (!firstAttempt.error) {
    return (firstAttempt.data ?? []) as LeadRow[];
  }

  if (isMissingContactColumnError(firstAttempt.error)) {
    throw new Error(
      "Database missing contact columns. Run migrations " +
        "003_person_first_contacts.sql, 004_contact_provenance.sql, and " +
        "005_multi_contact_support.sql in Supabase SQL editor, then retry.",
    );
  }

  throw formatSupabaseError(firstAttempt.error);
}