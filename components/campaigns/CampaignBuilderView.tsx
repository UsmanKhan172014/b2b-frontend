"use client";

import { AnimatePresence, motion } from "framer-motion";

import { CampaignChannelsStep } from "@/components/campaigns/CampaignChannelsStep";
import { CampaignParametersCard } from "@/components/campaigns/CampaignParametersCard";
import { CampaignReviewStep } from "@/components/campaigns/CampaignReviewStep";
import { CampaignStepper } from "@/components/campaigns/CampaignStepper";
import { CampaignTargetingStep } from "@/components/campaigns/CampaignTargetingStep";
import { EmailSequencePanel } from "@/components/campaigns/EmailSequencePanel";
import { TargetAudienceCard } from "@/components/campaigns/TargetAudienceCard";
import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Badge, Button, GlassCard } from "@/components/ui";
import { useCampaignBuilder } from "@/hooks/useCampaignBuilder";

interface CampaignBuilderViewProps {
  campaignId?: string;
}

export function CampaignBuilderView({ campaignId }: CampaignBuilderViewProps) {
  const {
    draft,
    activeStep,
    activeStepIndex,
    steps,
    objectiveLabel,
    toneLabel,
    draftSaved,
    setActiveStep,
    setObjective,
    setTone,
    saveDraft,
  } = useCampaignBuilder(campaignId);

  return (
    <div className="mx-auto w-full max-w-container-max">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-display-lg-mobile tracking-tight text-on-surface md:text-display-lg">
              Campaign Builder
            </h1>
            <Badge status="secondary" glow>
              UI Preview
            </Badge>
          </div>
          <p className="max-w-2xl text-body-base text-on-surface-variant">
            Configure AI-driven outreach parameters, generate dynamic content, and
            select delivery channels.
          </p>
        </div>

        <div className="flex w-full gap-3 md:w-auto">
          <Button variant="ghost" size="md" className="flex-1 md:flex-none" onClick={saveDraft}>
            Save Draft
          </Button>
          <Button size="md" className="flex-1 md:flex-none" disabled>
            <MaterialIcon name="rocket_launch" className="text-lg" />
            Launch Campaign
          </Button>
        </div>
      </div>

      {draftSaved ? (
        <p className="mb-4 font-mono text-label-mono text-secondary">
          Draft saved locally (Phase 2 will persist to Supabase).
        </p>
      ) : null}

      <GlassCard radius="section" className="mb-8 p-6">
        <CampaignStepper
          steps={steps}
          activeStepIndex={activeStepIndex}
          onStepChange={setActiveStep}
        />
      </GlassCard>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {activeStep === "targeting" ? (
            <CampaignTargetingStep
              tags={draft.audienceTags}
              estimatedReach={draft.estimatedReach}
            />
          ) : null}

          {activeStep === "content" ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-6 lg:col-span-4">
                <TargetAudienceCard
                  tags={draft.audienceTags}
                  estimatedReach={draft.estimatedReach}
                />
                <CampaignParametersCard
                  objective={draft.objective}
                  tone={draft.tone}
                  toneLabel={toneLabel}
                  onObjectiveChange={setObjective}
                  onToneChange={setTone}
                />
              </div>
              <div className="lg:col-span-8">
                <EmailSequencePanel steps={draft.emailSteps} />
              </div>
            </div>
          ) : null}

          {activeStep === "channels" ? <CampaignChannelsStep /> : null}

          {activeStep === "review" ? (
            <CampaignReviewStep
              campaignName={draft.name}
              audienceTags={draft.audienceTags}
              estimatedReach={draft.estimatedReach}
              objectiveLabel={objectiveLabel}
              toneLabel={toneLabel}
              emailStepCount={draft.emailSteps.length}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
