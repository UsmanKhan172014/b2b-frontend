import type { ConfidenceLevel, ResearchLead } from "@/lib/research/types";
import type { LeadRow } from "@/lib/queries";
import { sanitizeSourceUrls } from "@/lib/research/urls";

const INDUSTRY_ICONS: Record<string, string> = {
  saas: "domain",
  fintech: "account_balance",
  security: "shield",
  data: "hub",
  cloud: "cloud",
  devtools: "code",
  martech: "campaign",
};

function confidenceLevelFromScore(score: number): ConfidenceLevel {
  if (score >= 90) return "high";
  if (score >= 75) return "strong";
  return "moderate";
}

function iconForLead(row: LeadRow): string {
  if (row.contact_name?.trim()) return "person";
  const key = row.industry.toLowerCase();
  for (const [fragment, icon] of Object.entries(INDUSTRY_ICONS)) {
    if (key.includes(fragment)) return icon;
  }
  return "domain";
}

function buildSourceLinks(urls: string[] | null | undefined) {
  return sanitizeSourceUrls(urls).map((url, index) => {
    let label = "Source";
    let icon = "link";

    if (url.includes("linkedin")) {
      label = "LinkedIn";
      icon = "work";
    } else if (url.includes("crunchbase")) {
      label = "Crunchbase";
      icon = "account_balance";
    } else {
      try {
        label = new URL(url).hostname.replace(/^www\./, "");
      } catch {
        label = `Source ${index + 1}`;
      }
    }

    return {
      id: `source-${index}`,
      label,
      url,
      icon,
    };
  });
}

function contactTypeLabel(value?: string): string {
  switch (value) {
    case "corporate":
      return "Corporate office";
    case "sales":
      return "Sales office";
    case "role":
      return "Role inbox";
    case "general":
      return "General line";
    case "person":
      return "Direct person";
    default:
      return value ? value.replace(/_/g, " ") : "Contact";
  }
}

/**
 * Human-readable label for how confidently a LinkedIn URL was matched —
 * surfaced in the UI so an unverified name-only match isn't shown with the
 * same implied confidence as one scraped directly off the company's site.
 */
export function linkedinStatusLabel(value?: string | null): string | undefined {
  switch (value) {
    case "verified_on_company_site":
      return "Verified on company site";
    case "verified_context_match":
      return "Verified match";
    case "found_unverified":
      return "Unverified match";
    default:
      return undefined;
  }
}

/**
 * Maps a Supabase lead row into the UI ResearchLead shape (person-first).
 */
export function mapLeadRowToResearchLead(row: LeadRow): ResearchLead {
  const fitScore = Math.round(Number(row.confidence_score ?? 0));
  const signalText = row.rationale?.trim() || row.signal?.trim();
  const displayName = row.contact_name?.trim() || "Unknown contact";
  const companyLabel = row.company_name?.trim() || "—";
  const locationLabel = [row.size_estimate, row.region].filter(Boolean).join(", ");

  return {
    id: row.id,
    companyName: displayName,
    website: row.website,
    industry: row.contact_title?.trim() || row.industry,
    size: companyLabel,
    city: row.size_estimate?.trim() || undefined,
    country: row.region?.trim() || undefined,
    fitScore,
    icon: iconForLead(row),
    confidenceLevel: confidenceLevelFromScore(fitScore),
    summary: signalText || undefined,
    contactName: row.contact_name?.trim() || undefined,
    contactTitle: row.contact_title?.trim() || undefined,
    contactLinkedin: row.contact_linkedin?.trim() || undefined,
    contactEmail: row.contact_email?.trim() || undefined,
    contactPhone: row.contact_phone?.trim() || undefined,
    contactWhatsapp: row.contact_whatsapp?.trim() || undefined,
    contactConfidence: row.contact_confidence?.trim() || undefined,
    rationale: row.rationale?.trim() || undefined,
    contactPageUrl: row.contact_page_url?.trim() || undefined,
    contactType: row.contact_type?.trim() || undefined,
    companyEmail: row.company_email?.trim() || undefined,
    companyPhone: row.company_phone?.trim() || undefined,
    emailSourceUrl: row.email_source_url?.trim() || undefined,
    phoneSourceUrl: row.phone_source_url?.trim() || undefined,
    resolutionChannel: row.resolution_channel?.trim() || undefined,
    companyGroupId: row.company_group_id?.trim() || undefined,
    isPrimaryContact: row.is_primary_contact ?? true,
    contactRank: row.contact_rank ?? 1,
    linkedinStatus: row.linkedin_status?.trim() || undefined,
    signals: signalText
      ? [
          {
            id: `${row.id}-signal`,
            title: signalText,
            source: [
              row.resolution_channel
                ? `Channel: ${contactTypeLabel(row.resolution_channel ?? undefined)}`
                : null,
              row.contact_type
                ? `Contact type: ${contactTypeLabel(row.contact_type ?? undefined)}`
                : null,
              locationLabel ? `Location: ${locationLabel}` : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Research signal",
            icon: "radar",
            iconTone: "primary",
          },
        ]
      : [],
    sourceLinks: [
      ...buildSourceLinks(row.source_urls),
      ...(row.email_source_url
        ? [
            {
              id: `${row.id}-email-source`,
              label: "Email source",
              url: row.email_source_url,
              icon: "mail",
            },
          ]
        : []),
      ...(row.phone_source_url
        ? [
            {
              id: `${row.id}-phone-source`,
              label: "Phone source",
              url: row.phone_source_url,
              icon: "phone",
            },
          ]
        : []),
      ...(row.contact_page_url
        ? [
            {
              id: `${row.id}-contact-page`,
              label: "Contact page",
              url: row.contact_page_url,
              icon: "language",
            },
          ]
        : []),
    ],
  };
}