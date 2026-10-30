import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard, Input } from "@/components/ui";

interface CampaignTargetingStepProps {
  tags: string[];
  estimatedReach: number;
}

export function CampaignTargetingStep({
  tags,
  estimatedReach,
}: CampaignTargetingStepProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <GlassCard radius="section" className="p-6 sm:p-8">
        <h3 className="mb-6 flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="person_search" className="text-primary" />
          Define Target Audience
        </h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="font-mono text-label-mono uppercase text-on-surface-variant">
              Industry focus
            </label>
            <Input defaultValue="B2B SaaS" readOnly />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-label-mono uppercase text-on-surface-variant">
              Company stage
            </label>
            <Input defaultValue="Series A and above" readOnly />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-label-mono uppercase text-on-surface-variant">
              Region
            </label>
            <Input defaultValue="United States & Canada" readOnly />
          </div>
        </div>
      </GlassCard>

      <GlassCard radius="section" className="flex flex-col justify-center gap-4 p-6 sm:p-8">
        <p className="font-mono text-label-mono uppercase text-on-surface-variant">
          Preview
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-surface-variant px-3 py-1 font-mono text-label-mono text-on-surface-variant"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <MaterialIcon name="groups" className="text-primary" />
          <div>
            <p className="text-body-sm text-on-surface-variant">Estimated Reach</p>
            <p className="text-headline-md text-on-surface">
              {estimatedReach.toLocaleString()} contacts
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
