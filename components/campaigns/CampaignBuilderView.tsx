"use client";



import { AnimatePresence, motion } from "framer-motion";



import { CampaignSetupRequired } from "@/components/campaigns/CampaignSetupRequired";

import { CampaignChannelsStep } from "@/components/campaigns/CampaignChannelsStep";

import { CampaignParametersCard } from "@/components/campaigns/CampaignParametersCard";

import { CampaignReviewStep } from "@/components/campaigns/CampaignReviewStep";

import { CampaignStepNav } from "@/components/campaigns/CampaignStepNav";

import { CampaignStepper } from "@/components/campaigns/CampaignStepper";

import { CampaignTargetingStep } from "@/components/campaigns/CampaignTargetingStep";

import { CampaignTemplateSection } from "@/components/campaigns/CampaignTemplateSection";

import { EmailSequencePanel } from "@/components/campaigns/EmailSequencePanel";

import { TargetAudienceCard } from "@/components/campaigns/TargetAudienceCard";

import { Button, GlassCard } from "@/components/ui";

import { useCampaignBuilder } from "@/hooks/useCampaignBuilder";



interface CampaignBuilderViewProps {

  campaignId?: string;

  sessionId?: string;

  initialLeadIds?: string[];

}



export function CampaignBuilderView({

  campaignId,

  sessionId,

  initialLeadIds = [],

}: CampaignBuilderViewProps) {

  const {

    draft,

    activeStep,

    stepMeta,

    stepValidationMessage,

    objectiveLabel,

    toneLabel,

    draftSaved,

    isLoading,

    loadError,

    isLaunching,

    launchError,

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

    setAudienceFilters,

    toggleLeadSelection,

    selectFilteredWithEmail,

    clearLeadSelection,

    saveDraft,

    launchCampaign,

  } = useCampaignBuilder({ campaignId, sessionId, initialLeadIds });



  const canLaunch =

    draft.selectedLeadIds.length > 0 && draft.channels.email && !isLaunching;



  return (

    <div className="mx-auto w-full max-w-container-max">

      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">

        <div>

          <h1 className="mb-3 text-display-lg-mobile tracking-tight text-on-surface md:text-display-lg">

            Campaign Builder

          </h1>

          <p className="max-w-2xl text-body-base text-on-surface-variant">

            Follow the steps to select leads, pick an HTML email design, and launch outreach.

          </p>

        </div>



        <div className="flex w-full gap-3 md:w-auto">

          <Button

            variant="ghost"

            size="md"

            className="flex-1 md:flex-none"

            onClick={() => void saveDraft()}

            disabled={isLoading || isLaunching}

          >

            Save Draft

          </Button>

        </div>

      </div>



      {draftSaved ? (

        <p className="mb-4 font-mono text-label-mono text-secondary">Draft saved.</p>

      ) : null}



      {launchError ? (

        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm text-red-200">

          {launchError}

        </p>

      ) : null}



      {loadError ? (

        <div className="mb-8">

          <CampaignSetupRequired message={loadError} />

        </div>

      ) : null}



      {isLoading ? (

        <GlassCard radius="section" className="mb-8 p-8 text-body-sm text-on-surface-variant">

          Loading campaign data...

        </GlassCard>

      ) : loadError ? null : (

        <GlassCard radius="section" className="mb-8 p-6">

          <CampaignStepper

            steps={stepMeta}

            activeStepId={activeStep}

            onStepChange={setActiveStep}

          />

        </GlassCard>

      )}



      {!isLoading && !loadError ? (

        <>

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

                  leads={availableLeads}

                  researchSessions={researchSessions}

                  filters={audienceFilters}

                  selectedLeadIds={draft.selectedLeadIds}

                  estimatedReach={draft.estimatedReach}

                  audienceTags={draft.audienceTags}

                  onFiltersChange={setAudienceFilters}

                  onToggleLead={toggleLeadSelection}

                  onSelectFilteredWithEmail={selectFilteredWithEmail}

                  onClearSelection={clearLeadSelection}

                />

              ) : null}



              {activeStep === "content" ? (

                <div className="space-y-6">

                  <CampaignTemplateSection

                    templates={emailTemplates}

                    selectedTemplateSlug={draft.templateSlug}

                    onTemplateChange={setTemplateSlug}

                  />



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

                      <EmailSequencePanel

                        steps={draft.emailSteps}

                        templates={emailTemplates}

                        selectedTemplateSlug={draft.templateSlug}

                      />

                    </div>

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

                  templateName={selectedTemplate?.name ?? draft.templateSlug}

                  emailStepCount={draft.emailSteps.length}

                />

              ) : null}

            </motion.div>

          </AnimatePresence>



          <CampaignStepNav

            activeStepId={activeStep}

            validationMessage={stepValidationMessage}

            isLaunching={isLaunching}

            canLaunch={canLaunch}

            onBack={goToPreviousStep}

            onNext={goToNextStep}

            onLaunch={() => void launchCampaign()}

          />

        </>

      ) : null}

    </div>

  );

}


