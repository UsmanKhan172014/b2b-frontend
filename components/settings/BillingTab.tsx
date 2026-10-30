import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard } from "@/components/ui";

export function BillingTab() {
  return (
    <GlassCard
      radius="section"
      className="flex h-64 max-w-3xl flex-col items-center justify-center gap-3 p-8 text-center"
    >
      <MaterialIcon
        name="credit_card"
        className="text-4xl text-on-surface-variant/40"
      />
      <p className="text-body-sm text-on-surface-variant">
        Billing configuration module pending integration.
      </p>
    </GlassCard>
  );
}
