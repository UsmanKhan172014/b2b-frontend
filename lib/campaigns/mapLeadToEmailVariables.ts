import type { LeadRow } from "@/lib/queries";
import type { ResearchLead } from "@/lib/research/types";

type LeadLike = LeadRow | ResearchLead;

function isLeadRow(lead: LeadLike): lead is LeadRow {
  return "session_id" in lead;
}

function readContactName(lead: LeadLike): string {
  if (isLeadRow(lead)) return lead.contact_name?.trim() || "";
  return lead.contactName?.trim() || "";
}

function readCompany(lead: LeadLike): string {
  if (isLeadRow(lead)) return lead.company_name?.trim() || "";
  return lead.size?.trim() || "";
}

function readRole(lead: LeadLike): string {
  if (isLeadRow(lead)) {
    return lead.contact_title?.trim() || lead.industry?.trim() || "";
  }
  return lead.contactTitle?.trim() || lead.industry?.trim() || "";
}

function readRationale(lead: LeadLike): string {
  if (isLeadRow(lead)) {
    return lead.rationale?.trim() || lead.signal?.trim() || "";
  }
  return (
    lead.rationale?.trim() ||
    lead.summary?.trim() ||
    lead.signals?.[0]?.title ||
    ""
  );
}

/**
 * Resolves the best recipient email for a lead.
 */
export function resolveRecipientEmail(lead: LeadLike): string | null {
  const contactEmail = isLeadRow(lead)
    ? lead.contact_email?.trim() || ""
    : lead.contactEmail?.trim() || "";
  const companyEmail = isLeadRow(lead)
    ? lead.company_email?.trim() || ""
    : lead.companyEmail?.trim() || "";

  return contactEmail || companyEmail || null;
}

/**
 * Maps a research lead into email template variables.
 */
export function mapLeadToEmailVariables(
  lead: LeadLike,
  offer = "",
): Record<string, string> {
  const fullName = readContactName(lead);
  const firstName = fullName.split(/\s+/)[0] || "there";

  return {
    name: firstName,
    full_name: fullName || firstName,
    company: readCompany(lead),
    role: readRole(lead),
    rationale: readRationale(lead),
    offer: offer.trim() || "AI-powered B2B lead research and outreach",
    product: "LeadScope AI by Geniteams",
  };
}

/**
 * Returns true when a lead has a usable email address.
 */
export function leadHasEmail(lead: LeadLike): boolean {
  return resolveRecipientEmail(lead) !== null;
}
