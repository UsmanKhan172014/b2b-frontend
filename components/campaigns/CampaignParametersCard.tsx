"use client";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard } from "@/components/ui";
import { CAMPAIGN_OBJECTIVES } from "@/lib/campaigns/mockCampaign";
import type { CampaignObjective } from "@/lib/campaigns/types";

interface CampaignParametersCardProps {
  objective: CampaignObjective;
  tone: number;
  toneLabel: string;
  onObjectiveChange: (objective: CampaignObjective) => void;
  onToneChange: (tone: number) => void;
}

export function CampaignParametersCard({
  objective,
  tone,
  toneLabel,
  onObjectiveChange,
  onToneChange,
}: CampaignParametersCardProps) {
  return (
    <GlassCard radius="section" className="flex flex-1 flex-col gap-6 p-6">
      <div className="border-b border-white/10 pb-4">
        <h3 className="flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="tune" className="text-secondary" />
          AI Parameters
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="campaign-objective"
          className="font-mono text-label-mono text-on-surface-variant"
        >
          CAMPAIGN OBJECTIVE
        </label>
        <select
          id="campaign-objective"
          value={objective}
          className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-black/20 p-3 text-body-base text-on-surface transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          onChange={(event) => onObjectiveChange(event.target.value as CampaignObjective)}
        >
          {CAMPAIGN_OBJECTIVES.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-surface-container text-on-surface"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <label
            htmlFor="campaign-tone"
            className="font-mono text-label-mono text-on-surface-variant"
          >
            TONE OF VOICE
          </label>
          <span className="font-mono text-label-mono text-primary">{toneLabel}</span>
        </div>
        <input
          id="campaign-tone"
          type="range"
          min={1}
          max={100}
          value={tone}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-variant accent-primary"
          onChange={(event) => onToneChange(Number(event.target.value))}
        />
        <div className="mt-1 flex justify-between">
          <span className="text-body-sm text-on-surface-variant">Casual</span>
          <span className="text-body-sm text-on-surface-variant">Formal</span>
        </div>
      </div>

      <button
        type="button"
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-body-base text-on-surface transition-colors hover:bg-white/5"
      >
        <MaterialIcon name="psychology_alt" />
        Advanced Prompt Settings
      </button>
    </GlassCard>
  );
}
