"use client";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import type { EmailTemplate } from "@/lib/email/types";
import {
  getTemplateDesignPreview,
  partitionEmailTemplates,
} from "@/lib/email/templateCatalog";
import { cn } from "@/lib/cn";

interface EmailTemplatePickerProps {
  templates: EmailTemplate[];
  selectedTemplateSlug: string;
  onTemplateChange: (slug: string) => void;
}

function DesignPreviewMock({ template }: { template: EmailTemplate }) {
  const preview = getTemplateDesignPreview(template);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 shadow-sm">
      <div className={cn("h-8 px-2 py-1.5", preview.headerClass)}>
        <div className="h-1.5 w-12 rounded bg-white/80" />
        <div className="mt-1 h-1 w-8 rounded bg-white/40" />
      </div>
      <div className={cn("space-y-1.5 p-2", preview.bodyClass)}>
        <div className="h-1 w-full rounded bg-gray-300/80" />
        <div className="h-1 w-4/5 rounded bg-gray-300/60" />
        <div className={cn("mt-1 h-1.5 w-10 rounded", preview.accentClass)} />
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: EmailTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  const preview = getTemplateDesignPreview(template);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-primary bg-primary/10 ring-1 ring-primary/40"
          : "border-white/10 bg-surface/30 hover:border-white/20 hover:bg-surface/40",
      )}
    >
      <DesignPreviewMock template={template} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-body-sm font-medium text-on-surface">{preview.label}</p>
          {selected ? (
            <MaterialIcon name="check_circle" className="shrink-0 text-primary" />
          ) : null}
        </div>
        <p className="mt-1 text-body-sm text-on-surface-variant">{preview.description}</p>
        <p className="mt-2 font-mono text-label-mono text-on-surface-variant/70">
          {template.content_mode === "fixed" ? "Fixed copy" : "AI generated"}
        </p>
      </div>
    </button>
  );
}

export function EmailTemplatePicker({
  templates,
  selectedTemplateSlug,
  onTemplateChange,
}: EmailTemplatePickerProps) {
  const { htmlDesignTemplates, otherTemplates } = partitionEmailTemplates(templates);

  if (templates.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-surface/20 p-4 text-body-sm text-on-surface-variant">
        No email templates found. Run the Supabase email template migration first.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {htmlDesignTemplates.length > 0 ? (
        <div className="space-y-3">
          <div>
            <p className="font-mono text-label-mono uppercase text-on-surface-variant">
              HTML Email Design
            </p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Choose the HTML layout for your Geniteams AI outreach email.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {htmlDesignTemplates.map((template) => (
              <TemplateCard
                key={template.slug}
                template={template}
                selected={selectedTemplateSlug === template.slug}
                onSelect={() => onTemplateChange(template.slug)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {otherTemplates.length > 0 ? (
        <div className="space-y-3">
          <div>
            <p className="font-mono text-label-mono uppercase text-on-surface-variant">
              Other Templates
            </p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Alternative content styles (AI-generated body with different layouts).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {otherTemplates.map((template) => (
              <TemplateCard
                key={template.slug}
                template={template}
                selected={selectedTemplateSlug === template.slug}
                onSelect={() => onTemplateChange(template.slug)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
