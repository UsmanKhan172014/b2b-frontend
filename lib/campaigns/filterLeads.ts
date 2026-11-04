import { leadHasEmail } from "@/lib/campaigns/mapLeadToEmailVariables";
import type { ResearchLead } from "@/lib/research/types";

export interface CampaignLead extends ResearchLead {
  sessionId: string;
}

export interface CampaignAudienceFilters {
  search: string;
  sessionId: string;
  industry: string;
  company: string;
  minFitScore: number;
  emailOnly: boolean;
}

export interface ResearchSessionOption {
  id: string;
  label: string;
  leadCount: number;
}

export const DEFAULT_CAMPAIGN_FILTERS: CampaignAudienceFilters = {
  search: "",
  sessionId: "",
  industry: "",
  company: "",
  minFitScore: 0,
  emailOnly: true,
};

export function getCampaignFilterCategories(leads: CampaignLead[]) {
  const industries = new Set<string>();
  const companies = new Set<string>();
  const sessions = new Map<string, number>();

  for (const lead of leads) {
    if (lead.industry.trim()) industries.add(lead.industry.trim());
    if (lead.size.trim()) companies.add(lead.size.trim());
    if (lead.sessionId) {
      sessions.set(lead.sessionId, (sessions.get(lead.sessionId) ?? 0) + 1);
    }
  }

  return {
    industries: Array.from(industries).sort((a, b) => a.localeCompare(b)),
    companies: Array.from(companies).sort((a, b) => a.localeCompare(b)),
    sessionCounts: sessions,
  };
}

export function applyCampaignLeadFilters(
  leads: CampaignLead[],
  filters: CampaignAudienceFilters,
): CampaignLead[] {
  const query = filters.search.trim().toLowerCase();

  return leads.filter((lead) => {
    if (filters.sessionId && lead.sessionId !== filters.sessionId) return false;
    if (filters.industry && lead.industry !== filters.industry) return false;
    if (filters.company && lead.size !== filters.company) return false;
    if (filters.minFitScore > 0 && lead.fitScore < filters.minFitScore)
      return false;
    if (filters.emailOnly && !leadHasEmail(lead)) return false;

    if (!query) return true;

    return (
      lead.companyName.toLowerCase().includes(query) ||
      lead.size.toLowerCase().includes(query) ||
      (lead.contactName?.toLowerCase().includes(query) ?? false) ||
      (lead.contactTitle?.toLowerCase().includes(query) ?? false) ||
      (lead.contactEmail?.toLowerCase().includes(query) ?? false) ||
      (lead.companyEmail?.toLowerCase().includes(query) ?? false) ||
      lead.industry.toLowerCase().includes(query) ||
      (lead.rationale?.toLowerCase().includes(query) ?? false)
    );
  });
}

export function buildResearchSessionLabel(
  brief: Record<string, unknown>,
  createdAt: string,
): string {
  const offer = typeof brief.offer === "string" ? brief.offer.trim() : "";
  const location =
    typeof brief.targetLocation === "string"
      ? brief.targetLocation.trim()
      : typeof brief.target_location === "string"
        ? brief.target_location.trim()
        : "";
  const industry =
    typeof brief.industry === "string" ? brief.industry.trim() : "";
  const parts = [offer, location, industry].filter(Boolean);

  if (parts.length > 0) {
    const summary = parts.join(" · ");
    return summary.length > 72 ? `${summary.slice(0, 69)}...` : summary;
  }

  return `Research ${new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })}`;
}
