"use client";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button } from "@/components/ui";
import type { CampaignStepId } from "@/lib/campaigns/types";

interface CampaignStepNavProps {
  activeStepId: CampaignStepId;
  validationMessage: string | null;
  isLaunching: boolean;
  canLaunch: boolean;
  onBack: () => void;
  onNext: () => void;
  onLaunch: () => void;
}

export function CampaignStepNav({
  activeStepId,
  validationMessage,
  isLaunching,
  canLaunch,
  onBack,
  onNext,
  onLaunch,
}: CampaignStepNavProps) {
  const isFirstStep = activeStepId === "targeting";
  const isLastStep = activeStepId === "review";

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-h-[20px] text-body-sm text-amber-200">
        {validationMessage ?? ""}
      </div>

      <div className="flex gap-3">
        {!isFirstStep ? (
          <Button variant="ghost" size="md" onClick={onBack} disabled={isLaunching}>
            Back
          </Button>
        ) : null}

        {isLastStep ? (
          <Button size="md" disabled={!canLaunch} onClick={onLaunch}>
            <MaterialIcon name="rocket_launch" className="text-lg" />
            {isLaunching ? "Launching..." : "Launch Campaign"}
          </Button>
        ) : (
          <Button size="md" onClick={onNext} disabled={Boolean(validationMessage)}>
            Continue
            <MaterialIcon name="arrow_forward" className="text-lg" />
          </Button>
        )}
      </div>
    </div>
  );
}
