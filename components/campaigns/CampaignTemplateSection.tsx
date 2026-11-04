"use client";

import { EmailTemplatePicker } from "@/components/campaigns/EmailTemplatePicker";
import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard } from "@/components/ui";
import type { EmailTemplate } from "@/lib/email/types";
import { getTemplateDesignPreview } from "@/lib/email/templateCatalog";

interface CampaignTemplateSectionProps {
  templates: EmailTemplate[];
  selectedTemplateSlug: string;
  onTemplateChange: (slug: string) => void;
}

export function CampaignTemplateSection({
  templates,
  selectedTemplateSlug,
  onTemplateChange,
}: CampaignTemplateSectionProps) {
  const selectedTemplate = templates.find((template) => template.slug === selectedTemplateSlug);
  const selectedDesign = selectedTemplate
    ? getTemplateDesignPreview(selectedTemplate)
    : null;

  return (
    <GlassCard radius="section" className="mb-8 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/10 bg-surface/20 px-6 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
          <MaterialIcon name="palette" filled />
        </div>
        <div>
          <h2 className="text-headline-md text-on-surface">HTML Email Template</h2>
          <p className="text-body-sm text-on-surface-variant">
            {selectedDesign
              ? `Selected: ${selectedDesign.label}`
              : "Choose the HTML design used when this campaign sends."}
          </p>
        </div>
      </div>

      <div className="p-6">
        <EmailTemplatePicker
          templates={templates}
          selectedTemplateSlug={selectedTemplateSlug}
          onTemplateChange={onTemplateChange}
        />
      </div>
    </GlassCard>
  );
}
