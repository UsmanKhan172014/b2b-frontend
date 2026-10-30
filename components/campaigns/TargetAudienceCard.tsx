import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard } from "@/components/ui";

interface TargetAudienceCardProps {
  tags: string[];
  estimatedReach: number;
}

export function TargetAudienceCard({
  tags,
  estimatedReach,
}: TargetAudienceCardProps) {
  return (
    <GlassCard radius="section" className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="text-headline-md text-on-surface">Target Audience</h3>
        <button
          type="button"
          className="text-primary transition-colors hover:text-secondary"
          aria-label="Edit target audience"
        >
          <MaterialIcon name="edit" className="text-sm" />
        </button>
      </div>

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

      <div className="mt-2 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <MaterialIcon name="groups" className="mt-1 text-primary" />
        <div>
          <div className="text-body-sm text-on-surface-variant">Estimated Reach</div>
          <div className="text-headline-md text-on-surface">
            {estimatedReach.toLocaleString()}{" "}
            <span className="text-body-sm font-normal text-on-surface-variant">
              contacts
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
