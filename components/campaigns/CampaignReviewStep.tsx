import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard } from "@/components/ui";

interface CampaignReviewStepProps {
  campaignName: string;
  audienceTags: string[];
  estimatedReach: number;
  objectiveLabel: string;
  toneLabel: string;
  emailStepCount: number;
}

export function CampaignReviewStep({
  campaignName,
  audienceTags,
  estimatedReach,
  objectiveLabel,
  toneLabel,
  emailStepCount,
}: CampaignReviewStepProps) {
  return (
    <GlassCard radius="section" className="max-w-3xl p-6 sm:p-8">
      <h3 className="mb-6 flex items-center gap-2 text-headline-md text-on-surface">
        <MaterialIcon name="fact_check" className="text-primary" />
        Campaign Summary
      </h3>

      <div className="space-y-6 border-t border-white/10 pt-6">
        <div>
          <p className="font-mono text-label-mono uppercase text-on-surface-variant">
            Campaign name
          </p>
          <p className="mt-1 text-body-base text-on-surface">{campaignName}</p>
        </div>

        <div>
          <p className="font-mono text-label-mono uppercase text-on-surface-variant">
            Audience
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {audienceTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-surface-variant px-3 py-1 font-mono text-label-mono text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            {estimatedReach.toLocaleString()} estimated contacts
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-surface-container-low/50 p-4">
            <p className="font-mono text-label-mono uppercase text-on-surface-variant">
              Objective
            </p>
            <p className="mt-1 text-body-sm text-on-surface">{objectiveLabel}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-surface-container-low/50 p-4">
            <p className="font-mono text-label-mono uppercase text-on-surface-variant">
              Tone
            </p>
            <p className="mt-1 text-body-sm text-on-surface">{toneLabel}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-surface-container-low/50 p-4">
            <p className="font-mono text-label-mono uppercase text-on-surface-variant">
              Sequence
            </p>
            <p className="mt-1 text-body-sm text-on-surface">
              {emailStepCount} email steps
            </p>
          </div>
        </div>

        <p className="rounded-lg border border-secondary/20 bg-secondary/5 p-4 text-body-sm text-on-surface-variant">
          Launch and delivery integrations ship in Phase 2. This preview uses mock
          campaign data only.
        </p>
      </div>
    </GlassCard>
  );
}
