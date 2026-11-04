import type { EmailTemplate } from "@/lib/email/types";
import {
  GENITEAMS_AI_TEMPLATE_SLUGS,
  isGeniteamsAiTemplate,
  resolveEmailDesignVariant,
  type EmailDesignVariant,
} from "@/lib/email/emailDesigns";

export interface HtmlDesignPreview {
  variant: EmailDesignVariant | "inbound";
  label: string;
  description: string;
  headerClass: string;
  bodyClass: string;
  accentClass: string;
}

export const HTML_DESIGN_PREVIEWS: Record<
  EmailDesignVariant | "inbound",
  HtmlDesignPreview
> = {
  classic: {
    variant: "classic",
    label: "Classic",
    description: "Navy header with a clean white card layout.",
    headerClass: "bg-[#111827]",
    bodyClass: "bg-white",
    accentClass: "bg-indigo-500",
  },
  modern: {
    variant: "modern",
    label: "Modern Gradient",
    description: "Indigo-to-cyan gradient with a soft shadow card.",
    headerClass: "bg-gradient-to-r from-[#312e81] via-indigo-600 to-cyan-600",
    bodyClass: "bg-white",
    accentClass: "bg-emerald-400",
  },
  bold: {
    variant: "bold",
    label: "Bold Dark",
    description: "Dark theme with bright accents and Reply YES pill.",
    headerClass: "bg-slate-950 border-b border-slate-800",
    bodyClass: "bg-slate-900",
    accentClass: "bg-emerald-500",
  },
  minimal: {
    variant: "minimal",
    label: "Clean Minimal",
    description: "Light borders, extra whitespace, simple typography.",
    headerClass: "bg-gray-50 border-b border-gray-200",
    bodyClass: "bg-white",
    accentClass: "bg-gray-300",
  },
  inbound: {
    variant: "inbound",
    label: "Inbound Inquiry",
    description: "LeadScope AI layout styled like an incoming lead message.",
    headerClass: "bg-gradient-to-r from-[#312e81] via-indigo-600 to-cyan-600",
    bodyClass: "bg-white",
    accentClass: "bg-emerald-400",
  },
};

export function getTemplateDesignPreview(template: EmailTemplate): HtmlDesignPreview {
  const variant = resolveEmailDesignVariant(template.slug, template.layout_variant);

  if (template.layout_variant === "inbound" || template.slug === "b2b_cold_outreach") {
    return HTML_DESIGN_PREVIEWS.inbound;
  }

  return HTML_DESIGN_PREVIEWS[variant] ?? HTML_DESIGN_PREVIEWS.classic;
}

export function getTemplateDisplayName(
  slug: string,
  templates: EmailTemplate[] = [],
): string {
  const match = templates.find((template) => template.slug === slug);
  if (match) return match.name;

  const fallbackLabels: Record<string, string> = {
    geniteams_ai_classic: "Geniteams AI Outreach — Classic",
    geniteams_ai_modern: "Geniteams AI Outreach — Modern Gradient",
    geniteams_ai_bold: "Geniteams AI Outreach — Bold Dark",
    geniteams_ai_minimal: "Geniteams AI Outreach — Clean Minimal",
    b2b_cold_outreach: "Inbound Inquiry (LeadScope AI)",
    welcome_email: "Welcome Email",
  };

  return fallbackLabels[slug] ?? slug;
}

export function partitionEmailTemplates(templates: EmailTemplate[]) {
  const htmlDesignTemplates = templates
    .filter((template) => isGeniteamsAiTemplate(template.slug))
    .sort(
      (a, b) =>
        GENITEAMS_AI_TEMPLATE_SLUGS.indexOf(
          a.slug as (typeof GENITEAMS_AI_TEMPLATE_SLUGS)[number],
        ) -
        GENITEAMS_AI_TEMPLATE_SLUGS.indexOf(
          b.slug as (typeof GENITEAMS_AI_TEMPLATE_SLUGS)[number],
        ),
    );

  const otherTemplates = templates.filter(
    (template) => !isGeniteamsAiTemplate(template.slug),
  );

  return { htmlDesignTemplates, otherTemplates };
}
