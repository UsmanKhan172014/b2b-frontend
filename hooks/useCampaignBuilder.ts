"use client";

import { useCallback, useMemo, useState } from "react";

import {
  CAMPAIGN_OBJECTIVES,
  MOCK_CAMPAIGN_DRAFT,
  toneLabel,
} from "@/lib/campaigns/mockCampaign";
import type { CampaignObjective, CampaignStepId } from "@/lib/campaigns/types";
import { CAMPAIGN_STEPS } from "@/lib/campaigns/types";

export interface UseCampaignBuilderReturn {
  draft: typeof MOCK_CAMPAIGN_DRAFT;
  activeStep: CampaignStepId;
  activeStepIndex: number;
  steps: typeof CAMPAIGN_STEPS;
  objectiveLabel: string;
  toneLabel: string;
  draftSaved: boolean;
  setActiveStep: (step: CampaignStepId) => void;
  setObjective: (objective: CampaignObjective) => void;
  setTone: (tone: number) => void;
  saveDraft: () => void;
}

/**
 * Campaign builder state provider. Swap MOCK_CAMPAIGN_DRAFT for Supabase in Phase 2.
 */
export function useCampaignBuilder(_campaignId?: string): UseCampaignBuilderReturn {
  const [draft, setDraft] = useState(MOCK_CAMPAIGN_DRAFT);
  const [activeStep, setActiveStep] = useState<CampaignStepId>("content");
  const [draftSaved, setDraftSaved] = useState(false);

  const activeStepIndex = CAMPAIGN_STEPS.findIndex((step) => step.id === activeStep);

  const objectiveLabel = useMemo(
    () =>
      CAMPAIGN_OBJECTIVES.find((option) => option.value === draft.objective)?.label ??
      "Book a Demo",
    [draft.objective],
  );

  const setObjective = useCallback((objective: CampaignObjective) => {
    setDraft((current) => ({ ...current, objective }));
  }, []);

  const setTone = useCallback((tone: number) => {
    setDraft((current) => ({ ...current, tone }));
  }, []);

  const saveDraft = useCallback(() => {
    setDraftSaved(true);
    window.setTimeout(() => setDraftSaved(false), 2500);
  }, []);

  return {
    draft,
    activeStep,
    activeStepIndex,
    steps: CAMPAIGN_STEPS,
    objectiveLabel,
    toneLabel: toneLabel(draft.tone),
    draftSaved,
    setActiveStep,
    setObjective,
    setTone,
    saveDraft,
  };
}
