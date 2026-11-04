export type ConfidenceLevel = "high" | "strong" | "moderate";

export interface ResearchSignal {
  id: string;
  title: string;
  source: string;
  icon: string;
  iconTone?: "primary" | "secondary" | "tertiary";
}

export interface SourceLink {
  id: string;
  label: string;
  url: string;
  icon: string;
}

export interface ResearchLead {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  size: string;
  fitScore: number;
  icon: string;
  confidenceLevel: ConfidenceLevel;
  signals: ResearchSignal[];
  sourceLinks: SourceLink[];
  summary?: string;
  contactName?: string;
  contactTitle?: string;
  contactLinkedin?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactConfidence?: string;
  rationale?: string;
  contactPageUrl?: string;
  contactType?: string;
  companyEmail?: string;
  companyPhone?: string;
  emailSourceUrl?: string;
  phoneSourceUrl?: string;
  resolutionChannel?: string;
  city?: string;
  country?: string;
  companyGroupId?: string;
  isPrimaryContact?: boolean;
  contactRank?: number;
  linkedinStatus?: string;
  linkedinAbout?: string;
  linkedinSubtitle?: string;
  linkedinLocation?: string;
  linkedinExperience?: { role?: string; company?: string; duration?: string }[];
  linkedinEducation?: { school?: string; degree?: string; duration?: string }[];
  linkedinSkills?: { name?: string; skillName?: string }[];
  additionalContactCount?: number;
}

export type SortField = "fitScore" | "companyName" | "contactName" | "industry" | "size";
export type SortDirection = "asc" | "desc";

export interface ResearchResultsFilters {
  search: string;
  industry: string;
  size: string;
}

export interface ResearchResultsSort {
  field: SortField;
  direction: SortDirection;
}