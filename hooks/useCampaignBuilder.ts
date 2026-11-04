"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  applyCampaignLeadFilters,
  buildResearchSessionLabel,
  DEFAULT_CAMPAIGN_FILTERS,
  type CampaignAudienceFilters,
  type CampaignLead,
  type ResearchSessionOption,
} from "@/lib/campaigns/filterLeads";
import { leadHasEmail } from "@/lib/campaigns/mapLeadToEmailVariables";
import {
  CAMPAIGN_OBJECTIVES,
  toneLabel,
} from "@/lib/campaigns/mockCampaign";
import { getEmailTemplates, saveCampaign } from "@/lib/campaigns/queries";
import { formatSupabaseError } from "@/lib/supabase/errors";
import {
  CAMPAIGN_STEPS,
  createEmptyCampaignDraft,
  DEFAULT_TEMPLATE_SLUG,
  type CampaignDraft,
  type CampaignObjective,
  type CampaignStepId,
} from "@/lib/campaigns/types";
import {
  buildCampaignStepMeta,
  getNextStepId,
  getPreviousStepId,
  getStepValidationMessage,
} from "@/lib/campaigns/campaignSteps";
import type { EmailTemplate } from "@/lib/email/types";
import { getResearchSessions, type LeadRow } from "@/lib/queries";
import { mapLeadRowToResearchLead } from "@/lib/research/mapLeadRow";
import { logClientError } from "@/lib/logging";
import { createClient } from "@/lib/supabase/client";

export interface UseCampaignBuilderOptions {
  campaignId?: string;
  sessionId?: string;
  initialLeadIds?: string[];
}

export interface UseCampaignBuilderReturn {
  draft: CampaignDraft;
  activeStep: CampaignStepId;
  activeStepIndex: number;
  steps: typeof CAMPAIGN_STEPS;
  objectiveLabel: string;
  toneLabel: string;
  draftSaved: boolean;
  isLoading: boolean;
  loadError: string | null;
  isLaunching: boolean;
  launchError: string | null;
  launchSummary: { sent: number; failed: number; skipped: number } | null;
  availableLeads: CampaignLead[];
  researchSessions: ResearchSessionOption[];
  audienceFilters: CampaignAudienceFilters;
  emailTemplates: EmailTemplate[];
  selectedTemplate: EmailTemplate | null;
  stepMeta: ReturnType<typeof buildCampaignStepMeta>;
  stepValidationMessage: string | null;
  setActiveStep: (step: CampaignStepId) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setObjective: (objective: CampaignObjective) => void;
  setTone: (tone: number) => void;
  setTemplateSlug: (slug: string) => void;
  setAudienceFilters: (filters: CampaignAudienceFilters) => void;
  toggleLeadSelection: (leadId: string) => void;
  selectFilteredWithEmail: () => void;
  clearLeadSelection: () => void;
  saveDraft: () => Promise<void>;
  launchCampaign: () => Promise<void>;
}

function mapLeadRowToCampaignLead(row: LeadRow): CampaignLead {
  return {
    ...mapLeadRowToResearchLead(row),
    sessionId: row.session_id,
  };
}

export function useCampaignBuilder({
  campaignId,
  sessionId,
  initialLeadIds = [],
}: UseCampaignBuilderOptions = {}): UseCampaignBuilderReturn {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [draft, setDraft] = useState<CampaignDraft>(() =>
    createEmptyCampaignDraft({
      sourceSessionId: sessionId ?? null,
      selectedLeadIds: initialLeadIds,
      estimatedReach: initialLeadIds.length,
    }),
  );
  const [activeStep, setActiveStep] = useState<CampaignStepId>(
    initialLeadIds.length > 0 ? "content" : "targeting",
  );
  const [audienceFilters, setAudienceFilters] = useState<CampaignAudienceFilters>(() => ({
    ...DEFAULT_CAMPAIGN_FILTERS,
    sessionId: sessionId ?? "",
  }));
  const [draftSaved, setDraftSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [launchSummary, setLaunchSummary] = useState<{
    sent: number;
    failed: number;
    skipped: number;
  } | null>(null);
  const [availableLeads, setAvailableLeads] = useState<CampaignLead[]>([]);
  const [researchSessions, setResearchSessions] = useState<ResearchSessionOption[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("You must be signed in to build a campaign.");

        const [templates, sessions, leadsResult] = await Promise.all([
          getEmailTemplates(supabase),
          getResearchSessions(supabase, user.id),
          supabase.from("leads").select("*"),
        ]);

        if (leadsResult.error) throw leadsResult.error;

        if (cancelled) return;

        setEmailTemplates(templates);

        const matchedTemplate =
          templates.find((template) => template.slug === DEFAULT_TEMPLATE_SLUG) ??
          templates[0] ??
          null;

        const rows = (leadsResult.data ?? []) as LeadRow[];
        const mappedLeads = rows.map(mapLeadRowToCampaignLead);
        setAvailableLeads(mappedLeads);

        const sessionOptions: ResearchSessionOption[] = sessions
          .map((session) => ({
            id: session.id,
            label: buildResearchSessionLabel(session.brief, session.created_at),
            leadCount: mappedLeads.filter((lead) => lead.sessionId === session.id).length,
          }))
          .filter((session) => session.leadCount > 0);
        setResearchSessions(sessionOptions);

        const initialFilters: CampaignAudienceFilters = {
          ...DEFAULT_CAMPAIGN_FILTERS,
          sessionId: sessionId ?? "",
        };

        const filteredForPreselect = applyCampaignLeadFilters(mappedLeads, initialFilters);

        const preselected =
          initialLeadIds.length > 0
            ? initialLeadIds.filter((id) => {
                const lead = mappedLeads.find((item) => item.id === id);
                return lead ? leadHasEmail(lead) : false;
              })
            : filteredForPreselect.filter(leadHasEmail).map((lead) => lead.id);

        setAudienceFilters(initialFilters);
        setDraft((current) => ({
          ...current,
          sourceSessionId: sessionId ?? current.sourceSessionId,
          selectedLeadIds: preselected,
          estimatedReach: preselected.length,
          templateSlug: matchedTemplate?.slug ?? current.templateSlug,
          emailSteps: matchedTemplate
            ? current.emailSteps.map((step, index) =>
                index === 0
                  ? {
                      ...step,
                      subject: matchedTemplate.subject_template,
                      stepLabel: matchedTemplate.name,
                    }
                  : step,
              )
            : current.emailSteps,
          audienceTags: buildAudienceTags(
            mappedLeads,
            preselected,
            initialFilters,
            sessionOptions,
          ),
        }));
      } catch (error) {
        logClientError("campaign-builder", error);
        if (!cancelled) {
          setLoadError(formatSupabaseError(error).message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [supabase, sessionId, initialLeadIds.join(",")]);

  const objectiveLabel = useMemo(
    () =>
      CAMPAIGN_OBJECTIVES.find((option) => option.value === draft.objective)?.label ??
      "Book a Demo",
    [draft.objective],
  );

  const selectedTemplate = useMemo(
    () => emailTemplates.find((template) => template.slug === draft.templateSlug) ?? null,
    [emailTemplates, draft.templateSlug],
  );

  const setObjective = useCallback((objective: CampaignObjective) => {
    setDraft((current) => ({ ...current, objective }));
  }, []);

  const setTone = useCallback((tone: number) => {
    setDraft((current) => ({ ...current, tone }));
  }, []);

  const setTemplateSlug = useCallback(
    (slug: string) => {
      const template = emailTemplates.find((item) => item.slug === slug);
      setDraft((current) => ({
        ...current,
        templateSlug: slug,
        emailSteps: current.emailSteps.map((step, index) =>
          index === 0
            ? {
                ...step,
                subject: template?.subject_template ?? step.subject,
                stepLabel: template?.name ?? step.stepLabel,
              }
            : step,
        ),
      }));
    },
    [emailTemplates],
  );

  const goToNextStep = useCallback(() => {
    const nextStep = getNextStepId(activeStep);
    if (!nextStep) return;
    if (getStepValidationMessage(activeStep, draft)) return;
    setActiveStep(nextStep);
  }, [activeStep, draft]);

  const goToPreviousStep = useCallback(() => {
    const previousStep = getPreviousStepId(activeStep);
    if (previousStep) setActiveStep(previousStep);
  }, [activeStep]);

  const handleAudienceFiltersChange = useCallback(
    (filters: CampaignAudienceFilters) => {
      setAudienceFilters(filters);
      setDraft((current) => ({
        ...current,
        sourceSessionId: filters.sessionId || null,
        audienceTags: buildAudienceTags(
          availableLeads,
          current.selectedLeadIds,
          filters,
          researchSessions,
        ),
      }));
    },
    [availableLeads, researchSessions],
  );

  const toggleLeadSelection = useCallback(
    (leadId: string) => {
      setDraft((current) => {
        const isSelected = current.selectedLeadIds.includes(leadId);
        const selectedLeadIds = isSelected
          ? current.selectedLeadIds.filter((id) => id !== leadId)
          : [...current.selectedLeadIds, leadId];

        return {
          ...current,
          selectedLeadIds,
          estimatedReach: selectedLeadIds.length,
          audienceTags: buildAudienceTags(
            availableLeads,
            selectedLeadIds,
            audienceFilters,
            researchSessions,
          ),
        };
      });
    },
    [availableLeads, audienceFilters, researchSessions],
  );

  const selectFilteredWithEmail = useCallback(() => {
    const filtered = applyCampaignLeadFilters(availableLeads, audienceFilters);
    const ids = filtered.filter(leadHasEmail).map((lead) => lead.id);
    setDraft((current) => ({
      ...current,
      selectedLeadIds: ids,
      estimatedReach: ids.length,
      audienceTags: buildAudienceTags(
        availableLeads,
        ids,
        audienceFilters,
        researchSessions,
      ),
    }));
  }, [availableLeads, audienceFilters, researchSessions]);

  const clearLeadSelection = useCallback(() => {
    setDraft((current) => ({
      ...current,
      selectedLeadIds: [],
      estimatedReach: 0,
      audienceTags: buildAudienceTags(availableLeads, [], audienceFilters, researchSessions),
    }));
  }, [availableLeads, audienceFilters, researchSessions]);

  const saveDraft = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const saved = await saveCampaign(supabase, { userId: user.id, draft });
    setDraft(saved);
    setDraftSaved(true);
    window.setTimeout(() => setDraftSaved(false), 2500);
  }, [supabase, draft]);

  const launchCampaign = useCallback(async () => {
    setLaunchError(null);
    setLaunchSummary(null);
    setIsLaunching(true);

    try {
      const response = await fetch("/api/campaigns/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Campaign launch failed");
      }

      setLaunchSummary({
        sent: data.sent,
        failed: data.failed,
        skipped: data.skipped,
      });

      if (data.campaignId) {
        router.push(`/campaigns/${data.campaignId}`);
      }
    } catch (error) {
      setLaunchError(error instanceof Error ? error.message : "Campaign launch failed");
    } finally {
      setIsLaunching(false);
    }
  }, [draft, router]);

  const activeStepIndex = CAMPAIGN_STEPS.findIndex((step) => step.id === activeStep);

  const stepMeta = useMemo(
    () => buildCampaignStepMeta(draft, selectedTemplate),
    [draft, selectedTemplate],
  );

  const stepValidationMessage = useMemo(
    () => getStepValidationMessage(activeStep, draft),
    [activeStep, draft],
  );

  return {
    draft,
    activeStep,
    activeStepIndex,
    steps: CAMPAIGN_STEPS,
    stepMeta,
    stepValidationMessage,
    objectiveLabel,
    toneLabel: toneLabel(draft.tone),
    draftSaved,
    isLoading,
    loadError,
    isLaunching,
    launchError,
    launchSummary,
    availableLeads,
    researchSessions,
    audienceFilters,
    emailTemplates,
    selectedTemplate,
    setActiveStep,
    goToNextStep,
    goToPreviousStep,
    setObjective,
    setTone,
    setTemplateSlug,
    setAudienceFilters: handleAudienceFiltersChange,
    toggleLeadSelection,
    selectFilteredWithEmail,
    clearLeadSelection,
    saveDraft,
    launchCampaign,
  };
}

function buildAudienceTags(
  leads: CampaignLead[],
  selectedLeadIds: string[],
  filters: CampaignAudienceFilters,
  sessionOptions: ResearchSessionOption[],
): string[] {
  const tags = new Set<string>();

  if (filters.sessionId) {
    const session = sessionOptions.find((item) => item.id === filters.sessionId);
    tags.add(session?.label ?? "Research session");
  }
  if (filters.industry) tags.add(filters.industry);
  if (filters.company) tags.add(filters.company);
  if (filters.minFitScore > 0) tags.add(`Fit ${filters.minFitScore}+`);
  if (filters.search.trim()) tags.add(`Search: ${filters.search.trim()}`);

  for (const lead of leads) {
    if (!selectedLeadIds.includes(lead.id)) continue;
    if (lead.industry) tags.add(lead.industry);
    if (lead.size) tags.add(lead.size);
  }

  return Array.from(tags).slice(0, 8);
}
