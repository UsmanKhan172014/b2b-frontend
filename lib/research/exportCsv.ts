import type { ResearchLead } from "./types";

function escapeCsvValue(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
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
      return value ?? "";
  }
}

function channelLabel(value?: string): string {
  if (!value) return "";
  const readable = value.replace(/^enrichment_/, "").replace(/_/g, " ");
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

function linkedinStatusLabel(value?: string): string {
  switch (value) {
    case "verified_on_company_site":
      return "Verified";
    case "verified_context_match":
      return "Verified match";
    case "provider_matched":
      return "Verified match";
    case "found_unverified":
      return "Unverified match";
    default:
      return "";
  }
}

const EXPORT_HEADERS = [
  "Full Name",
  "Title",
  "Company",
  "Company Group",
  "Primary Contact",
  "Contact Rank",
  "City",
  "Country",
  "Person Email",
  "Person Phone",
  "Company Email",
  "Company Phone",
  "Contact Type",
  "Resolution Channel",
  "Email Source URL",
  "Phone Source URL",
  "WhatsApp",
  "LinkedIn",
  "LinkedIn Verification",
  "Website",
  "Contact Page",
  "Confidence",
  "Fit Score",
  "Rationale",
  "Source URLs",
] as const;

function leadToExportRow(lead: ResearchLead): string[] {
  const sourceUrls = lead.sourceLinks.map((link) => link.url).join("; ");
  return [
    lead.contactName ?? lead.companyName,
    lead.contactTitle ?? lead.industry,
    lead.size || "",
    lead.companyGroupId ?? lead.companyName,
    lead.isPrimaryContact === false ? "No" : "Yes",
    String(lead.contactRank ?? 1),
    lead.city ?? "",
    lead.country ?? "",
    lead.contactEmail ?? "",
    lead.contactPhone ?? "",
    lead.companyEmail ?? "",
    lead.companyPhone ?? "",
    contactTypeLabel(lead.contactType),
    channelLabel(lead.resolutionChannel),
    lead.emailSourceUrl ?? "",
    lead.phoneSourceUrl ?? "",
    lead.contactWhatsapp ?? "",
    lead.contactLinkedin ?? "",
    linkedinStatusLabel(lead.linkedinStatus),
    lead.website,
    lead.contactPageUrl ?? "",
    lead.contactConfidence ?? lead.confidenceLevel,
    `${lead.fitScore}%`,
    lead.rationale ?? lead.summary ?? "",
    sourceUrls,
  ];
}

/**
 * Groups rows by company (primary first, then its additional decision-makers
 * by rank) so a company's contacts sit next to each other in the exported
 * file, rather than in whatever order the source list happened to be in.
 */
function sortForExport(leads: ResearchLead[]): ResearchLead[] {
  return [...leads].sort((a, b) => {
    const groupA = a.companyGroupId ?? a.companyName;
    const groupB = b.companyGroupId ?? b.companyName;
    if (groupA !== groupB) return groupA.localeCompare(groupB);
    return (a.contactRank ?? 1) - (b.contactRank ?? 1);
  });
}

/**
 * Triggers a browser download of research leads as CSV.
 */
export function exportLeadsToCsv(leads: ResearchLead[], filename = "leadscope-contacts.csv") {
  const rows = sortForExport(leads).map(leadToExportRow);
  const csv = [EXPORT_HEADERS, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Triggers a browser download of research leads as XLSX (via CSV-compatible TSV fallback).
 * Uses tab-separated values with .xls extension for Excel compatibility without extra deps.
 */
export function exportLeadsToXlsx(leads: ResearchLead[], filename = "leadscope-contacts.xls") {
  const rows = sortForExport(leads).map(leadToExportRow);
  const tsv = [EXPORT_HEADERS, ...rows]
    .map((row) => row.map(escapeCsvValue).join("\t"))
    .join("\n");

  const blob = new Blob([tsv], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}