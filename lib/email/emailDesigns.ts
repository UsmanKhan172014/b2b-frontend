import {
  emailDarkBrandedHeader,
  emailFooterLogo,
  emailLightBrandedHeader,
  emailLogoImg,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
} from "@/lib/email/emailLayout";

export type EmailDesignVariant = "classic" | "modern" | "bold" | "minimal" | "inbound";

export interface EmailDesignMeta {
  recipientName: string;
  company: string;
}

const DESIGN_LABELS: Record<EmailDesignVariant, string> = {
  classic: "Classic",
  modern: "Modern Gradient",
  bold: "Bold Dark",
  minimal: "Clean Minimal",
  inbound: "Inbound Inquiry",
};

export function getEmailDesignLabel(variant: EmailDesignVariant): string {
  return DESIGN_LABELS[variant];
}

export function resolveEmailDesignVariant(
  slug: string,
  layoutVariant?: string | null,
): EmailDesignVariant {
  if (layoutVariant === "classic" || layoutVariant === "modern" || layoutVariant === "bold" || layoutVariant === "minimal" || layoutVariant === "inbound") {
    return layoutVariant === "inbound" ? "classic" : layoutVariant;
  }

  if (slug.endsWith("_modern")) return "modern";
  if (slug.endsWith("_bold")) return "bold";
  if (slug.endsWith("_minimal")) return "minimal";
  if (slug.startsWith("geniteams_ai_")) return "classic";

  return "classic";
}

function footerBlock(variant: EmailDesignVariant, meta: EmailDesignMeta): string {
  const companyLine = meta.company ? ` · ${meta.company}` : "";

  switch (variant) {
    case "bold":
      return `<tr>
        <td style="padding:20px 28px;background-color:#0b1220;border-top:1px solid #1f2937;">
          ${emailFooterLogo(90)}
          <p style="margin:0 0 6px;color:#e2e8f0;font-size:13px;font-weight:600;">${PRODUCT_NAME} ${PRODUCT_TAGLINE}</p>
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">Sent to ${meta.recipientName}${companyLine}. Reply YES for examples or book a 15-min call.</p>
        </td>
      </tr>`;
    case "minimal":
      return `<tr>
        <td style="padding:18px 32px;border-top:1px solid #e5e7eb;">
          ${emailFooterLogo(80)}
          <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;">${PRODUCT_NAME} ${PRODUCT_TAGLINE}</p>
        </td>
      </tr>`;
    default:
      return `<tr>
        <td style="padding:18px 28px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
          ${emailFooterLogo(90)}
          <p style="margin:0 0 6px;color:#334155;font-size:13px;font-weight:600;">${PRODUCT_NAME} ${PRODUCT_TAGLINE}</p>
          <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">Personalized for ${meta.recipientName}${companyLine}.</p>
        </td>
      </tr>`;
  }
}

function wrapClassic(bodyHtml: string, meta: EmailDesignMeta): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${PRODUCT_NAME}</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:28px 14px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
        <tr>
          <td style="background-color:#111827;padding:22px 28px;">
            ${emailDarkBrandedHeader()}
          </td>
        </tr>
        <tr><td style="padding:28px;">${bodyHtml}</td></tr>
        ${footerBlock("classic", meta)}
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function wrapModern(bodyHtml: string, meta: EmailDesignMeta): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${PRODUCT_NAME}</title></head>
<body style="margin:0;padding:0;background:linear-gradient(180deg,#eef2ff 0%,#f8fafc 100%);font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 14px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 18px 40px rgba(79,70,229,0.16);">
        <tr>
          <td style="background:linear-gradient(135deg,#312e81 0%,#4f46e5 50%,#0891b2 100%);padding:26px 30px;">
            ${emailDarkBrandedHeader()}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 30px 0;">
            <span style="display:inline-block;margin-top:18px;background:#ecfdf5;color:#047857;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:7px 12px;border-radius:999px;border:1px solid #a7f3d0;">
              AI Solutions for ${meta.company || "Your Team"}
            </span>
          </td>
        </tr>
        <tr><td style="padding:22px 30px 28px;">${bodyHtml}</td></tr>
        ${footerBlock("modern", meta)}
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function wrapBold(bodyHtml: string, meta: EmailDesignMeta): string {
  const darkBody = bodyHtml
    .replace(/#0f172a/g, "#f8fafc")
    .replace(/#1e293b/g, "#e2e8f0")
    .replace(/#334155/g, "#cbd5e1")
    .replace(/#475569/g, "#94a3b8")
    .replace(/#4f46e5/g, "#38bdf8");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${PRODUCT_NAME}</title></head>
<body style="margin:0;padding:0;background-color:#020617;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#020617;padding:32px 14px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;box-shadow:0 20px 50px rgba(0,0,0,0.45);">
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #1f2937;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td valign="middle" style="width:1%;white-space:nowrap;">
                  ${emailLogoImg(120)}
                </td>
                <td align="right" valign="middle">
                  <span style="display:inline-block;background:#064e3b;color:#6ee7b7;font-size:11px;font-weight:700;padding:8px 12px;border-radius:8px;">Reply YES</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="padding:28px;">${darkBody}</td></tr>
        ${footerBlock("bold", meta)}
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function wrapMinimal(bodyHtml: string, meta: EmailDesignMeta): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${PRODUCT_NAME}</title></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:36px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;border:1px solid #e5e7eb;border-radius:4px;">
        <tr>
          <td style="padding:24px 32px 8px;border-bottom:1px solid #f3f4f6;">
            ${emailLightBrandedHeader()}
            <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9ca3af;">To ${meta.recipientName}${meta.company ? ` at ${meta.company}` : ""}</p>
          </td>
        </tr>
        <tr><td style="padding:28px 32px;font-family:Arial,Helvetica,sans-serif;">${bodyHtml}</td></tr>
        ${footerBlock("minimal", meta)}
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function wrapEmailDesign(
  variant: EmailDesignVariant,
  bodyHtml: string,
  meta: EmailDesignMeta,
): string {
  switch (variant) {
    case "modern":
      return wrapModern(bodyHtml, meta);
    case "bold":
      return wrapBold(bodyHtml, meta);
    case "minimal":
      return wrapMinimal(bodyHtml, meta);
    case "classic":
    default:
      return wrapClassic(bodyHtml, meta);
  }
}

export const GENITEAMS_AI_TEMPLATE_SLUGS = [
  "geniteams_ai_classic",
  "geniteams_ai_modern",
  "geniteams_ai_bold",
  "geniteams_ai_minimal",
] as const;

export function isGeniteamsAiTemplate(slug: string): boolean {
  return GENITEAMS_AI_TEMPLATE_SLUGS.includes(
    slug as (typeof GENITEAMS_AI_TEMPLATE_SLUGS)[number],
  );
}
