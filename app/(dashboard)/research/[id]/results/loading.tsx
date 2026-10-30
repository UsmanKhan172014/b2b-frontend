import { GlassCard } from "@/components/ui";

export default function ResearchResultsLoading() {
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-panel-gap">
      <div className="space-y-3">
        <div className="h-8 w-72 animate-pulse rounded-lg bg-surface-container-high/80" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-surface-container-high/60" />
      </div>
      <GlassCard
        radius="section"
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] p-6"
      >
        <div className="mb-6 h-10 animate-pulse rounded-lg bg-surface-container-high/70" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-lg border border-white/5 bg-surface-container-low/50"
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
