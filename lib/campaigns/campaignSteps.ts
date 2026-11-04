import type { CampaignDraft, CampaignStepId } from "@/lib/campaigns/types";
import type { EmailTemplate } from "@/lib/email/types";
import { getTemplateDesignPreview } from "@/lib/email/templateCatalog";

export interface CampaignStepMeta {
  id: CampaignStepId;
  stepNumber: number;
  label: string;
  subtitle: string;
  isComplete: boolean;
}

export const CAMPAIGN_STEP_ORDER: CampaignStepId[] = [
  "targeting",
  "content",
  "channels",
  "review",
];

export function buildCampaignStepMeta(
  draft: CampaignDraft,
  selectedTemplate: EmailTemplate | null,
): CampaignStepMeta[] {
  const designLabel = selectedTemplate
    ? getTemplateDesignPreview(selectedTemplate).label
    : "Not selected";

  return [
    {
      id: "targeting",
      stepNumber: 1,
      label: "Targeting",
      subtitle:
        draft.selectedLeadIds.length > 0
          ? `${draft.selectedLeadIds.length} lead${draft.selectedLeadIds.length === 1 ? "" : "s"} selected`
          : "Select recipients with email",
      isComplete: draft.selectedLeadIds.length > 0,
    },
    {
      id: "content",
      stepNumber: 2,
      label: "Email Template",
      subtitle: selectedTemplate?.name ?? designLabel,
      isComplete: Boolean(draft.templateSlug),
    },
    {
      id: "channels",
      stepNumber: 3,
      label: "Channels",
      subtitle: draft.channels.email ? "Email enabled" : "Enable a channel",
      isComplete: draft.channels.email,
    },
    {
      id: "review",
      stepNumber: 4,
      label: "Review",
      subtitle: "Confirm and launch",
      isComplete:
        draft.selectedLeadIds.length > 0 &&
        Boolean(draft.templateSlug) &&
        draft.channels.email,
    },
  ];
}

export function getStepValidationMessage(
  stepId: CampaignStepId,
  draft: CampaignDraft,
): string | null {
  switch (stepId) {
    case "targeting":
      return draft.selectedLeadIds.length === 0
        ? "Select at least one lead with an email address."
        : null;
    case "content":
      return draft.templateSlug ? null : "Choose an HTML email template.";
    case "channels":
      return draft.channels.email ? null : "Enable the email channel to continue.";
    case "review":
      return getStepValidationMessage("targeting", draft) ??
        getStepValidationMessage("content", draft) ??
        getStepValidationMessage("channels", draft);
    default:
      return null;
  }
}

export function getNextStepId(stepId: CampaignStepId): CampaignStepId | null {
  const index = CAMPAIGN_STEP_ORDER.indexOf(stepId);
  return index >= 0 && index < CAMPAIGN_STEP_ORDER.length - 1
    ? CAMPAIGN_STEP_ORDER[index + 1]
    : null;
}

export function getPreviousStepId(stepId: CampaignStepId): CampaignStepId | null {
  const index = CAMPAIGN_STEP_ORDER.indexOf(stepId);
  return index > 0 ? CAMPAIGN_STEP_ORDER[index - 1] : null;
}
