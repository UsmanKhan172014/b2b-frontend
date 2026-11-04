import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard } from "@/components/ui";

interface CampaignSetupRequiredProps {
  message: string;
}

export function CampaignSetupRequired({ message }: CampaignSetupRequiredProps) {
  return (
    <GlassCard radius="section" className="border-secondary/30 bg-secondary/5 p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <MaterialIcon name="database" className="mt-0.5 text-secondary" />
          <div>
            <h2 className="text-headline-md text-on-surface">Campaign database setup required</h2>
            <p className="mt-2 text-body-sm text-on-surface-variant">{message}</p>
          </div>
        </div>
        <ol className="list-decimal space-y-2 pl-6 text-body-sm text-on-surface-variant">
          <li>Open your Supabase project dashboard.</li>
          <li>Go to SQL Editor.</li>
          <li>
            Run the migration file{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-label-mono">
              frontend-app/supabase/migrations/006_email_campaigns.sql
            </code>
          </li>
          <li>Refresh this page.</li>
        </ol>
      </div>
    </GlassCard>
  );
}
