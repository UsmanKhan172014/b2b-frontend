"use client";

import { motion } from "framer-motion";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard } from "@/components/ui";
import type { CampaignEmailStep } from "@/lib/campaigns/types";
import { cn } from "@/lib/cn";

interface EmailSequencePanelProps {
  steps: CampaignEmailStep[];
}

function EmailStepCard({ step }: { step: CampaignEmailStep }) {
  return (
    <motion.div
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border border-white/10 p-5",
        step.isFollowUp ? "bg-surface/20 opacity-70 hover:opacity-100" : "bg-surface/40",
      )}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          className="rounded border border-white/10 bg-surface p-1.5 text-on-surface-variant transition-colors hover:text-primary"
          aria-label="Copy email"
        >
          <MaterialIcon name="content_copy" className="text-sm" />
        </button>
        <button
          type="button"
          className="rounded border border-white/10 bg-surface p-1.5 text-on-surface-variant transition-colors hover:text-primary"
          aria-label="Edit email"
        >
          <MaterialIcon name="edit" className="text-sm" />
        </button>
      </div>

      <div className="mb-2 flex items-center gap-3">
        <span className="rounded bg-surface-variant px-2 py-1 font-mono text-label-mono text-on-surface">
          {step.dayLabel}
        </span>
        <span className="text-body-sm text-on-surface-variant">{step.stepLabel}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-mono text-label-mono text-on-surface-variant">SUBJECT</span>
        <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-body-base text-on-surface">
          {step.subject}
        </div>
      </div>

      {step.body ? (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-label-mono text-on-surface-variant">BODY</span>
          <div className="min-h-[120px] whitespace-pre-line rounded-lg border border-white/10 bg-black/20 p-4 text-body-base text-on-surface">
            {step.body}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

export function EmailSequencePanel({ steps }: EmailSequencePanelProps) {
  return (
    <GlassCard
      radius="section"
      className="relative flex h-full flex-col overflow-hidden"
    >
      <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="flex items-center justify-between border-b border-white/10 bg-surface/20 p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
            <MaterialIcon name="edit_document" filled />
          </div>
          <h2 className="text-headline-md text-on-surface">Email Sequence</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center justify-center rounded-lg border border-white/10 p-2 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
            aria-label="View history"
          >
            <MaterialIcon name="history" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-body-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <MaterialIcon name="auto_awesome" className="text-sm" />
            Regenerate All
          </button>
        </div>
      </div>

      <div className="flex max-h-[600px] flex-1 flex-col gap-6 overflow-y-auto p-6">
        {steps.map((step) => (
          <EmailStepCard key={step.id} step={step} />
        ))}

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-4 text-body-sm text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary"
        >
          <MaterialIcon name="add" />
          Add Follow-up Step
        </button>
      </div>
    </GlassCard>
  );
}
