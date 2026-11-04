"use client";

import { AnimatePresence, motion } from "framer-motion";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Button } from "@/components/ui";
import {
  type ProgressConnectionState,
  type ProgressErrorReason,
  type ResearchStage,
  useResearchProgress,
} from "@/hooks/useResearchProgress";
import { cn } from "@/lib/cn";

interface ResearchProgressViewProps {
  sessionId: string;
}

/** Format stage duration: seconds, then minutes, then hours. */
function formatElapsedDuration(seconds: number): string {
  const total = Math.max(0, Number(seconds) || 0);
  if (total < 60) {
    return `${Number(total.toFixed(2))}s`;
  }

  if (total < 3600) {
    const minutes = Math.floor(total / 60);
    const secs = Math.round(total % 60);
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function statusBadgeLabel(
  connectionState: ProgressConnectionState,
  errorReason: ProgressErrorReason | null,
): string {
  switch (connectionState) {
    case "connecting":
      return "Connecting";
    case "persisting":
      return "Saving Results";
    case "complete":
      return "Analysis Complete";
    case "error":
      if (errorReason === "quota") return "Service Busy";
      if (errorReason === "limit") return "Limit Reached";
      if (errorReason === "persist") return "Save Failed";
      if (errorReason === "session") return "Session Error";
      if (errorReason === "pipeline") return "Analysis Paused";
      if (errorReason === "no_contacts") return "No Actionable Leads";
      return "Connection Lost";
    default:
      return "Live Analysis";
  }
}

function StageIndicator({ stage }: { stage: ResearchStage }) {
  if (stage.status === "done") {
    return (
      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-surface shadow-glow-primary-sm">
        <MaterialIcon name="check" className="text-sm text-primary" />
      </div>
    );
  }

  if (stage.status === "active") {
    return (
      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-secondary bg-surface shadow-glow-secondary">
        <span className="size-2 rounded-full bg-secondary pulse-dot" />
      </div>
    );
  }

  return (
    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-white/20 bg-surface">
      <MaterialIcon
        name="radio_button_unchecked"
        className="text-sm text-white/20"
      />
    </div>
  );
}

function StageLogs({ logs }: { logs: string[] }) {
  return (
    <div className="group relative mt-4 overflow-hidden rounded-lg border border-white/5 bg-surface-container-lowest/80 p-4">
      <div className="scanline-overlay pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent opacity-100" />
      <div className="relative space-y-2 font-mono text-[11px] leading-relaxed text-on-surface-variant/80 md:text-xs">
        {logs.map((line, index) => {
          const isLatest = index === logs.length - 1;
          const isHighlight =
            line.toLowerCase().includes("potential matches") ||
            line.toLowerCase().includes("candidate");

          return (
            <div key={`${line}-${index}`} className="flex items-start gap-2">
              <span className="text-primary/50">&gt;</span>
              <span
                className={cn(
                  isLatest && "typewriter text-on-surface",
                  isHighlight && !isLatest && "text-secondary-fixed",
                  !isLatest && !isHighlight && "opacity-70",
                )}
              >
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineStage({
  stage,
  activeLogs,
  isLast,
}: {
  stage: ResearchStage;
  activeLogs: string[];
  isLast: boolean;
}) {
  const isActive = stage.status === "active";
  const isDone = stage.status === "done";
  const isPending = stage.status === "pending";
  const showLogs = isActive && stage.id === "extracting" && activeLogs.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{
        opacity: isPending ? 0.4 : 1,
        x: 0,
      }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "relative flex items-start gap-4 md:gap-6",
        !isLast && "pb-8",
        isDone && "group",
      )}
    >
      <StageIndicator stage={stage} />
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.h4
            key={`${stage.id}-${stage.status}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={cn(
              "font-semibold",
              isActive
                ? "text-lg text-secondary"
                : "text-base text-on-surface",
              isDone && "opacity-70 transition-opacity group-hover:opacity-100",
            )}
          >
            {stage.label}
          </motion.h4>
        </AnimatePresence>

        {isDone && stage.elapsedSeconds !== undefined && (
          <p className="mt-1 font-mono text-on-surface-variant/50">
            {formatElapsedDuration(stage.elapsedSeconds)}
          </p>
        )}

        {isPending && (
          <p className="mt-1 font-mono text-on-surface-variant/50">Pending</p>
        )}

        {showLogs && <StageLogs logs={activeLogs} />}
      </div>
    </motion.div>
  );
}

function ProgressErrorPanel({
  errorReason,
  errorMessage,
  onRetry,
}: {
  errorReason: ProgressErrorReason;
  errorMessage: string | null;
  onRetry: () => void;
}) {
  const copy: Record<
    ProgressErrorReason,
    { icon: string; title: string; description: string; action: string }
  > = {
    quota: {
      icon: "speed",
      title: "Service busy",
      description:
        "Our research service is at capacity right now. Please try again in a few minutes.",
      action: "Try Again Later",
    },
    limit: {
      icon: "block",
      title: "Limit reached",
      description: errorMessage ?? "You cannot start another research run right now.",
      action: "Back to Dashboard",
    },
    connection: {
      icon: "cloud_off",
      title: "Connection interrupted",
      description:
        "We lost contact with the research service. Check your connection, then reconnect.",
      action: "Retry Connection",
    },
    pipeline: {
      icon: "error_outline",
      title: "Analysis could not continue",
      description:
        "The research pipeline stopped before completion. Retry to run a fresh analysis for this session.",
      action: "Retry Analysis",
    },
    no_contacts: {
      icon: "person_off",
      title: "Not enough actionable contacts",
      description:
        "Research ran but fewer than 50% of your lead goal had a real person name plus email or phone. Try Advanced depth, increase lead goal buffer, or broaden roles and region.",
      action: "Retry Analysis",
    },
    persist: {
      icon: "save",
      title: "Could not save results",
      description:
        "Research finished but saving leads failed. Retry to persist your results without re-running the full pipeline.",
      action: "Retry Save",
    },
    session: {
      icon: "folder_off",
      title: "Session unavailable",
      description:
        "This research session could not be loaded. It may have been deleted or you may not have access.",
      action: "Back to Dashboard",
    },
  };

  const content = copy[errorReason];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-surface-container-low/80 p-6 backdrop-blur-panel-lg"
    >
      <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-white/10 bg-surface-container/90 p-8 text-center shadow-glow-secondary-sm">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-error/20 bg-error-container/10">
          <MaterialIcon name={content.icon} className="text-3xl text-error/80" />
        </div>
        <h3 className="mb-2 text-headline-sm text-on-surface">{content.title}</h3>
        <p className="mb-8 max-w-sm text-body-sm leading-relaxed text-on-surface-variant">
          {content.description}
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={onRetry}
          className="min-w-[180px] justify-center shadow-xl shadow-primary/20"
        >
          <MaterialIcon name="refresh" />
          {content.action}
        </Button>
      </div>
    </motion.div>
  );
}

/**
 * Live research progress timeline matching the Stitch live-progress reference.
 */
export function ResearchProgressView({ sessionId }: ResearchProgressViewProps) {
  const {
    stages,
    isComplete,
    progressPercent,
    activeLogs,
    connectionState,
    errorReason,
    errorMessage,
    retry,
    cancel,
  } = useResearchProgress(sessionId);

  const isLive =
    connectionState === "streaming" ||
    connectionState === "connecting" ||
    connectionState === "persisting";

  return (
    <div className="relative flex w-full justify-center py-4 sm:py-8">
      <div className="ambient-glow pointer-events-none absolute top-1/2 left-1/2 size-[min(100vw,600px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-primary)_5%,transparent)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-primary/20 bg-surface-container-low/60 shadow-glow-secondary-sm backdrop-blur-panel-lg">
        <div className="relative h-1 shrink-0 overflow-hidden bg-surface-container">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-container to-secondary-container"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="relative flex flex-col p-6 sm:p-8 md:p-12">
          <AnimatePresence>
            {connectionState === "error" && errorReason && (
              <ProgressErrorPanel
                errorReason={errorReason}
                errorMessage={errorMessage}
                onRetry={retry}
              />
            )}
          </AnimatePresence>

          <div
            className={cn(
              "mb-8 text-center md:mb-10 md:text-left",
              connectionState === "error" && "pointer-events-none opacity-40",
            )}
          >
            <div
              className={cn(
                "mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1",
                connectionState === "error"
                  ? "border-error/20 bg-error-container/10"
                  : "border-secondary/20 bg-secondary-container/10",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full pulse-dot",
                  connectionState === "error" ? "bg-error/80" : "bg-secondary",
                )}
              />
              <span
                className={cn(
                  "font-mono text-[10px] tracking-wider uppercase",
                  connectionState === "error"
                    ? "text-error/80"
                    : "text-secondary",
                )}
              >
                {statusBadgeLabel(connectionState, errorReason)}
              </span>
            </div>
            <h2 className="mb-3 flex items-center justify-center gap-3 text-display-lg-mobile text-on-surface md:justify-start md:text-display-lg">
              Research in Progress
              {isLive && (
                <MaterialIcon
                  name="autorenew"
                  className="animate-spin text-primary [animation-duration:3s]"
                />
              )}
            </h2>
            <p className="mx-auto max-w-xl text-body-base text-on-surface-variant md:mx-0">
              LeadScope AI is analyzing millions of data points to find your
              ideal targets based on the provided search parameters.
            </p>
            <p className="mt-2 font-mono text-label-mono text-on-surface-variant/60">
              Session {sessionId}
            </p>
          </div>

          <div
            className={cn(
              "relative flex-1 pl-6 md:pl-8",
              connectionState === "error" && "pointer-events-none opacity-40",
            )}
          >
            <div className="absolute top-4 bottom-4 left-[11px] w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:left-[15px]" />

            <div className="space-y-0">
              {stages.map((stage, index) => (
                <TimelineStage
                  key={stage.id}
                  stage={stage}
                  activeLogs={activeLogs}
                  isLast={index === stages.length - 1}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end border-t border-white/5 pt-6 md:mt-10">
            <button
              type="button"
              onClick={cancel}
              disabled={connectionState === "persisting" || connectionState === "complete"}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-body-sm text-on-surface-variant transition-colors hover:border-error/30 hover:bg-white/5 hover:text-error disabled:opacity-50"
            >
              <MaterialIcon name="close" className="text-base" />
              Cancel Research
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
