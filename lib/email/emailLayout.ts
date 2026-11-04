export const PRODUCT_NAME = "Sales Copilot";
export const PRODUCT_TAGLINE = "by Geniteams";
export const GENITEAM_LOGO_URL = "https://www.geniteam.com/assets/images/header-logo.png";

export function emailLogoImg(width = 140): string {
  return `<img src="${GENITEAM_LOGO_URL}" alt="GenITeam" width="${width}" style="display:block;border:0;outline:none;text-decoration:none;max-width:${width}px;height:auto;" />`;
}

export function emailDarkBrandedHeader(): string {
  return emailLogoImg(130);
}

export function emailLightBrandedHeader(): string {
  return `<div style="background:#111827;border-radius:8px;padding:8px 10px;display:inline-block;line-height:0;">
    ${emailLogoImg(110)}
  </div>`;
}

export function emailFooterLogo(width = 90): string {
  return `<img src="${GENITEAM_LOGO_URL}" alt="GenITeam" width="${width}" style="display:block;margin:0 0 8px;border:0;outline:none;text-decoration:none;max-width:${width}px;height:auto;" />`;
}

export interface InboundInquiryLayoutOptions {
  senderName: string;
  senderRole: string;
  senderCompany: string;
}

function senderInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

/**
 * Wraps generated email body in a Sales Copilot inbound-inquiry layout.
 * Presents the message as if the prospect reached out to Geniteams.
 */
export function wrapInboundInquiryLayout(
  bodyHtml: string,
  options: InboundInquiryLayoutOptions,
): string {
  const { senderName, senderRole, senderCompany } = options;
  const initial = senderInitial(senderName);
  const roleLine = [senderRole, senderCompany].filter(Boolean).join(" · ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${PRODUCT_NAME} - New Inbound Inquiry</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2ff;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 45px rgba(79,70,229,0.18);">
          <tr>
            <td style="background:linear-gradient(135deg,#312e81 0%,#4f46e5 45%,#0891b2 100%);padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle" style="width:1%;white-space:nowrap;">
                    ${emailLogoImg(120)}
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;background-color:rgba(16,185,129,0.18);border:1px solid rgba(110,231,183,0.45);color:#ecfdf5;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:8px 12px;border-radius:999px;">
                      ● New Inquiry
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #6366f1;border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="top" style="padding-right:14px;">
                          <div style="width:44px;height:44px;line-height:44px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#ffffff;font-size:18px;font-weight:700;text-align:center;">
                            ${initial}
                          </div>
                        </td>
                        <td valign="top">
                          <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Incoming message from</p>
                          <p style="margin:0 0 4px;color:#0f172a;font-size:18px;font-weight:700;">${senderName || "Prospect"}</p>
                          <p style="margin:0;color:#475569;font-size:14px;line-height:1.5;">${roleLine || senderCompany || "Research lead"}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 28px;color:#1e293b;font-size:16px;line-height:1.7;">
              ${bodyHtml}
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px 24px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
              ${emailFooterLogo()}
              <p style="margin:0 0 8px;color:#334155;font-size:13px;font-weight:600;">Powered by ${PRODUCT_NAME} ${PRODUCT_TAGLINE}</p>
              <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                This inquiry was matched to your research pipeline. Reply to continue the conversation with ${senderName || "this lead"}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
