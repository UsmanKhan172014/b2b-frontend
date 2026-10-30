import { cn } from "@/lib/cn";

interface FitScoreBadgeProps {
  score: number;
  className?: string;
}

/**
 * JetBrains Mono fit score pill — gradient glow for top-tier matches.
 */
export function FitScoreBadge({ score, className }: FitScoreBadgeProps) {
  const isTopTier = score >= 90;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] font-bold",
        isTopTier
          ? "bg-gradient-accent text-on-primary shadow-glow-primary-sm"
          : "border border-white/10 bg-surface-variant text-on-surface",
        className,
      )}
    >
      {score}%
    </span>
  );
}
