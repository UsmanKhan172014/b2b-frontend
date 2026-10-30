import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard } from "@/components/ui";
import { cn } from "@/lib/cn";

const CHANNELS = [
  {
    id: "email",
    label: "Email",
    description: "Multi-step personalized email sequences",
    icon: "mail",
    enabled: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Connection requests and InMail follow-ups",
    icon: "work",
    enabled: false,
  },
] as const;

export function CampaignChannelsStep() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {CHANNELS.map((channel) => (
        <GlassCard
          key={channel.id}
          radius="section"
          className={cn(
            "p-6 transition-colors",
            channel.enabled && "border-primary/30 bg-primary/5",
          )}
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="flex size-12 items-center justify-center rounded-xl border border-white/10 bg-surface-container">
              <MaterialIcon
                name={channel.icon}
                className={channel.enabled ? "text-primary" : "text-on-surface-variant"}
              />
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 font-mono text-label-mono",
                channel.enabled
                  ? "border border-secondary/30 bg-secondary/10 text-secondary"
                  : "border border-white/10 bg-surface-variant text-on-surface-variant",
              )}
            >
              {channel.enabled ? "Selected" : "Coming soon"}
            </span>
          </div>
          <h3 className="text-headline-md text-on-surface">{channel.label}</h3>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            {channel.description}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
