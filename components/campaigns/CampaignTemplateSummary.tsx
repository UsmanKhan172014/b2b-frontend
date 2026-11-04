import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { GlassCard } from "@/components/ui";
import type { EmailTemplate } from "@/lib/email/types";
import {
  getTemplateDesignPreview,
  getTemplateDisplayName,
} from "@/lib/email/templateCatalog";
import { cn } from "@/lib/cn";

interface CampaignTemplateSummaryProps {
  templateSlug: string;
  template?: EmailTemplate | null;
}

function DesignPreviewMock({
  templateSlug,
  template,
}: {
  templateSlug: string;
  template?: EmailTemplate | null;
}) {
  const preview = template
    ? getTemplateDesignPreview(template)
    : getTemplateDesignPreview({
        id: "",
        slug: templateSlug,
        name: templateSlug,
        subject_template: "",
        system_prompt: "",
        user_prompt_template: "",
        fallback_html: null,
        layout_variant:
          templateSlug === "b2b_cold_outreach"
            ? "inbound"
            : templateSlug.replace("geniteams_ai_", ""),
        content_mode: templateSlug.startsWith("geniteams_ai_") ? "fixed" : "ai",
        created_at: "",
      });

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 shadow-sm">
      <div className={cn("h-10 px-3 py-2", preview.headerClass)}>
        <div className="h-1.5 w-14 rounded bg-white/80" />
        <div className="mt-1.5 h-1 w-10 rounded bg-white/40" />
      </div>
      <div className={cn("space-y-1.5 p-3", preview.bodyClass)}>
        <div className="h-1 w-full rounded bg-gray-300/80" />
        <div className="h-1 w-4/5 rounded bg-gray-300/60" />
        <div className={cn("mt-1 h-2 w-12 rounded", preview.accentClass)} />
      </div>
    </div>
  );
}

export function CampaignTemplateSummary({
  templateSlug,
  template,
}: CampaignTemplateSummaryProps) {
  const displayName = getTemplateDisplayName(templateSlug, template ? [template] : []);
  const preview = template
    ? getTemplateDesignPreview(template)
    : getTemplateDesignPreview({
        id: "",
        slug: templateSlug,
        name: displayName,
        subject_template: "",
        system_prompt: "",
        user_prompt_template: "",
        fallback_html: null,
        layout_variant:
          templateSlug === "b2b_cold_outreach"
            ? "inbound"
            : templateSlug.replace("geniteams_ai_", ""),
        content_mode: templateSlug.startsWith("geniteams_ai_") ? "fixed" : "ai",
        created_at: "",
      });

  return (
    <GlassCard radius="section" className="mb-8 overflow-hidden">
      <div className="border-b border-white/10 px-6 py-4">
        <h2 className="flex items-center gap-2 text-headline-md text-on-surface">
          <MaterialIcon name="palette" className="text-primary" />
          HTML Email Template
        </h2>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr]">
        <DesignPreviewMock templateSlug={templateSlug} template={template} />

        <div className="space-y-2">
          <p className="text-body-base font-medium text-on-surface">{displayName}</p>
          <p className="text-body-sm text-on-surface-variant">{preview.description}</p>
          <p className="font-mono text-label-mono text-on-surface-variant/80">
            slug: {templateSlug}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            {template?.content_mode === "fixed" || templateSlug.startsWith("geniteams_ai_")
              ? "Fixed Geniteams outreach copy with dynamic name and company."
              : "AI-generated email content with the selected layout."}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
