"use client";

import { motion } from "framer-motion";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard } from "@/components/ui";
import type { CampaignEmailStep } from "@/lib/campaigns/types";
import type { EmailTemplate } from "@/lib/email/types";
import { getGeniteamsAiOutreachPlainPreview } from "@/lib/email/geniteamsAiOutreach";
import { isGeniteamsAiTemplate } from "@/lib/email/emailDesigns";
import { cn } from "@/lib/cn";

interface EmailSequencePanelProps {
  steps: CampaignEmailStep[];
  templates: EmailTemplate[];
  selectedTemplateSlug: string;
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

export function EmailSequencePanel({
  steps,
  templates,
  selectedTemplateSlug,
}: EmailSequencePanelProps) {
  const selectedTemplate = templates.find((template) => template.slug === selectedTemplateSlug);
  const isFixedTemplate =
    selectedTemplate?.content_mode === "fixed" ||
    (selectedTemplate ? isGeniteamsAiTemplate(selectedTemplate.slug) : false);

  const previewCopy = isFixedTemplate
    ? getGeniteamsAiOutreachPlainPreview({
        name: "{{name}}",
        company: "{{company}}",
      })
    : null;

  return (
    <GlassCard
      radius="section"
      className="relative flex h-full flex-col overflow-hidden"
    >
      <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="flex items-center gap-3 border-b border-white/10 bg-surface/20 p-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
          <MaterialIcon name="edit_document" filled />
        </div>
        <h2 className="text-headline-md text-on-surface">Email Sequence</h2>
      </div>

      {selectedTemplate && previewCopy ? (
        <div className="border-b border-white/10 px-6 py-4 text-body-sm text-on-surface-variant">
          <p className="mb-2 font-medium text-on-surface">Email copy preview</p>
          <div className="rounded-lg border border-white/10 bg-black/20 p-4 whitespace-pre-line text-body-sm text-on-surface">
            {previewCopy}
          </div>
        </div>
      ) : null}

      {selectedTemplate && !isFixedTemplate ? (
        <div className="border-b border-white/10 px-6 py-4 text-body-sm text-on-surface-variant">
          <p>
            <span className="font-medium text-on-surface">AI prompt:</span>{" "}
            {selectedTemplate.user_prompt_template}
          </p>
        </div>
      ) : null}

      <div className="flex max-h-[600px] flex-1 flex-col gap-6 overflow-y-auto p-6">
        {steps.map((step) => (
          <EmailStepCard key={step.id} step={step} />
        ))}

        <p className="rounded-lg border border-white/10 bg-surface/20 p-4 text-body-sm text-on-surface-variant">
          Select your HTML design in the section above. Launch sends the first email
          using that design for each lead.
        </p>
      </div>
    </GlassCard>
  );
}
