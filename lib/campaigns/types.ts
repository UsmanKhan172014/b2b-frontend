export type CampaignStepId = "targeting" | "content" | "channels" | "review";

export type CampaignObjective =
  | "demo"
  | "webinar"
  | "newsletter";

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
  emailSteps: CampaignEmailStep[];
  channels: {
    email: boolean;
    linkedin: boolean;
  };
}

export const CAMPAIGN_STEPS: {
  id: CampaignStepId;
  stepNumber: number;
  label: string;
}[] = [
  { id: "targeting", stepNumber: 1, label: "Targeting" },
  { id: "content", stepNumber: 2, label: "AI Content" },
  { id: "channels", stepNumber: 3, label: "Channels" },
  { id: "review", stepNumber: 4, label: "Review" },
];
