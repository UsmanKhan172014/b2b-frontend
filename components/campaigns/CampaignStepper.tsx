"use client";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import type { CampaignStepId } from "@/lib/campaigns/types";
import type { CampaignStepMeta } from "@/lib/campaigns/campaignSteps";
import { cn } from "@/lib/cn";

interface CampaignStepperProps {
  steps: CampaignStepMeta[];
  activeStepId: CampaignStepId;
  onStepChange: (stepId: CampaignStepId) => void;
}

export function CampaignStepper({
  steps,
  activeStepId,
  onStepChange,
}: CampaignStepperProps) {
  const activeStepIndex = steps.findIndex((step) => step.id === activeStepId);

  return (
    <div className="relative flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
      <div className="absolute top-1/2 right-0 left-0 hidden h-0.5 -translate-y-1/2 bg-white/5 md:block" />

      {steps.map((step, index) => {
        const isComplete = step.isComplete && step.id !== activeStepId;
        const isActive = step.id === activeStepId;
        const isPending = !isComplete && !isActive;

        return (
          <button
            key={step.id}
            type="button"
            className={cn(
              "relative z-10 flex w-full items-center gap-4 rounded-xl bg-surface/80 p-3 text-left transition-colors md:w-auto md:max-w-[220px] md:flex-col md:gap-2 md:bg-transparent md:p-0",
              isActive && "ring-1 ring-primary/30 md:ring-0",
            )}
            onClick={() => onStepChange(step.id)}
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full border font-bold",
                isComplete &&
                  "border-primary/50 bg-primary/20 text-primary shadow-glow-primary-sm",
                isActive &&
                  "border-primary bg-surface-variant text-primary shadow-glow-primary-sm",
                isPending &&
                  "border-white/10 bg-surface-variant text-on-surface-variant",
              )}
            >
              {isComplete ? (
                <MaterialIcon name="check" className="text-lg" filled />
              ) : (
                <span className="text-body-base">{step.stepNumber}</span>
              )}
            </div>

            <div className="min-w-0 flex flex-col md:items-center md:text-center">
              <span
                className={cn(
                  "font-mono text-label-mono",
                  isActive || isComplete ? "text-primary" : "text-on-surface-variant",
                )}
              >
                STEP {String(step.stepNumber).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "text-body-base font-semibold",
                  isPending ? "text-on-surface-variant" : "text-on-surface",
                )}
              >
                {step.label}
              </span>
              <span className="mt-0.5 truncate text-body-sm text-on-surface-variant">
                {step.subtitle}
              </span>
            </div>
          </button>
        );
      })}

      <span className="sr-only">
        Step {activeStepIndex + 1} of {steps.length}
      </span>
    </div>
  );
}
