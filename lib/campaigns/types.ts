export type CampaignStepId = "targeting" | "content" | "channels" | "review";

export type CampaignObjective = "demo" | "webinar" | "newsletter";

export type CampaignStatus = "draft" | "sending" | "completed" | "failed";

export type CampaignRecipientStatus = "pending" | "sent" | "failed" | "skipped";

export interface CampaignEmailStep {
  id: string;
  dayLabel: string;
  stepLabel: string;
  subject: string;
  body?: string;
  isFollowUp?: boolean;
}

export interface CampaignDraft {
  id: string;
  name: string;
  audienceTags: string[];
  estimatedReach: number;
  objective: CampaignObjective;
  tone: number;
  templateSlug: string;
  sourceSessionId: string | null;
  selectedLeadIds: string[];
  emailSteps: CampaignEmailStep[];
  channels: {
    email: boolean;
    linkedin: boolean;
  };
  status?: CampaignStatus;
}

export interface CampaignRow {
  id: string;
  user_id: string;
  name: string;
  objective: CampaignObjective;
  tone: number;
  template_slug: string;
  status: CampaignStatus;
  source_session_id: string | null;
  selected_lead_ids: string[];
  channels: { email: boolean; linkedin: boolean };
  email_steps: CampaignEmailStep[];
  created_at: string;
  launched_at: string | null;
}

export interface CampaignRecipientRow {
  id: string;
  campaign_id: string;
  lead_id: string | null;
  recipient_email: string;
  variables: Record<string, string>;
  status: CampaignRecipientStatus;
  message_id: string | null;
  error: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface CampaignListItem {
  id: string;
  name: string;
  status: CampaignStatus;
  templateSlug: string;
  recipientCount: number;
  sentCount: number;
  createdAt: string;
  launchedAt: string | null;
}

export const CAMPAIGN_STEPS: {
  id: CampaignStepId;
  stepNumber: number;
  label: string;
}[] = [
  { id: "targeting", stepNumber: 1, label: "Targeting" },
  { id: "content", stepNumber: 2, label: "Email Template" },
  { id: "channels", stepNumber: 3, label: "Channels" },
  { id: "review", stepNumber: 4, label: "Review" },
];

export const DEFAULT_TEMPLATE_SLUG = "geniteams_ai_classic";

export function createEmptyCampaignDraft(
  overrides: Partial<CampaignDraft> = {},
): CampaignDraft {
  return {
    id: "",
    name: "New Outreach Campaign",
    audienceTags: [],
    estimatedReach: 0,
    objective: "demo",
    tone: 75,
    templateSlug: DEFAULT_TEMPLATE_SLUG,
    sourceSessionId: null,
    selectedLeadIds: [],
    channels: { email: true, linkedin: false },
    emailSteps: [
      {
        id: "email-1",
        dayLabel: "Day 1",
        stepLabel: "Geniteams AI Outreach",
        subject: "{{name}}, quick idea on AI for {{company}}",
        body: "Fixed Geniteams AI outreach copy with dynamic name and company. Choose a design variant in the template picker.",
      },
    ],
    status: "draft",
    ...overrides,
  };
}

export function mapCampaignRowToDraft(row: CampaignRow): CampaignDraft {
  return {
    id: row.id,
    name: row.name,
    audienceTags: [],
    estimatedReach: row.selected_lead_ids.length,
    objective: row.objective,
    tone: row.tone,
    templateSlug: row.template_slug,
    sourceSessionId: row.source_session_id,
    selectedLeadIds: row.selected_lead_ids ?? [],
    emailSteps: row.email_steps?.length
      ? row.email_steps
      : createEmptyCampaignDraft().emailSteps,
    channels: row.channels ?? { email: true, linkedin: false },
    status: row.status,
  };
}
