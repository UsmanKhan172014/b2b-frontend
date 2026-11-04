import { generateEmailBody, interpolateVariables } from "@/lib/email/ai-generator";
import {
  isGeniteamsAiTemplate,
  resolveEmailDesignVariant,
  wrapEmailDesign,
} from "@/lib/email/emailDesigns";
import { wrapInboundInquiryLayout } from "@/lib/email/emailLayout";
import { buildGeniteamsAiOutreachBody } from "@/lib/email/geniteamsAiOutreach";
import { sendEmail } from "@/lib/email/mailer";
import type { EmailTemplate, SendDynamicEmailResult } from "@/lib/email/types";
import { logServerError } from "@/lib/security/http";

function isFixedContentTemplate(template: EmailTemplate): boolean {
  return template.content_mode === "fixed" || isGeniteamsAiTemplate(template.slug);
}

function isInboundInquiryTemplate(template: EmailTemplate): boolean {
  return template.slug === "b2b_cold_outreach" || template.layout_variant === "inbound";
}

function wrapTemplateHtml(
  template: EmailTemplate,
  bodyHtml: string,
  variables: Record<string, string>,
): string {
  if (isInboundInquiryTemplate(template)) {
    return wrapInboundInquiryLayout(bodyHtml, {
      senderName: variables.full_name || variables.name || "Prospect",
      senderRole: variables.role || "",
      senderCompany: variables.company || "",
    });
  }

  const designVariant = resolveEmailDesignVariant(template.slug, template.layout_variant);
  return wrapEmailDesign(designVariant, bodyHtml, {
    recipientName: variables.full_name || variables.name || "there",
    company: variables.company || "",
  });
}

/**
 * Loads a template, renders fixed or AI HTML, applies the selected design, and sends via SMTP.
 */
export async function sendDynamicEmail(
  template: EmailTemplate,
  recipientEmail: string,
  variables: Record<string, string>,
): Promise<SendDynamicEmailResult> {
  const finalSubject = interpolateVariables(template.subject_template, variables);

  let generatedHtmlBody: string;
  let usedFallback = false;

  if (isFixedContentTemplate(template)) {
    generatedHtmlBody = buildGeniteamsAiOutreachBody(variables);
    usedFallback = true;
  } else {
    const finalUserPrompt = interpolateVariables(template.user_prompt_template, variables);

    try {
      generatedHtmlBody = await generateEmailBody(template.system_prompt, finalUserPrompt);
    } catch (aiError) {
      logServerError("email-ai-fallback", aiError);

      if (!template.fallback_html) {
        throw aiError;
      }

      generatedHtmlBody = interpolateVariables(template.fallback_html, variables);
      usedFallback = true;
    }
  }

  const wrappedHtml = wrapTemplateHtml(template, generatedHtmlBody, variables);

  const mailInfo = await sendEmail({
    to: recipientEmail,
    subject: finalSubject,
    html: wrappedHtml,
  });

  return {
    messageId: mailInfo.messageId,
    subject: finalSubject,
    usedFallback,
    htmlPreview: wrappedHtml,
  };
}


