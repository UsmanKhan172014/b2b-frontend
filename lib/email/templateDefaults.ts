import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/email/emailLayout";

export const B2B_INBOUND_INQUIRY_SYSTEM_PROMPT = `You are an expert B2B copywriter for ${PRODUCT_NAME} ${PRODUCT_TAGLINE}.
Write a short inbound inquiry email in clean HTML using inline styles only.
Do not wrap output in markdown code fences.
Do not include outer html/head/body tags — only the inner message content (paragraphs, optional emphasis).

IMPORTANT STYLE:
- Write in FIRST PERSON as the prospect (use "I", "we", "our team").
- The prospect is reaching OUT to the ${PRODUCT_NAME} team at Geniteams — not the other way around.
- Sound genuinely interested, specific, and professional — like a real inbound message.
- Reference their company context and why they are reaching out now.
- Keep it under 140 words.
- End with a sign-off using their name, role, and company.
- Use subtle inline styling for emphasis where helpful (e.g. color on one key phrase).`;

export const B2B_INBOUND_INQUIRY_USER_PROMPT = `Write an inbound inquiry email AS {{full_name}} ({{role}} at {{company}}) TO the ${PRODUCT_NAME} team at Geniteams.

They are interested in: {{offer}}.
Why they are a fit / reason for reaching out: {{rationale}}.

The message should feel like THEY sent this email to us — curious, warm, and specific to {{company}}.
Open with a greeting to the ${PRODUCT_NAME} / Geniteams team.
Include one clear ask (e.g. a brief call or demo).
Sign off as {{full_name}}, {{role}}, {{company}}.`;

export const B2B_INBOUND_INQUIRY_SUBJECT =
  "Re: {{full_name}} from {{company}} — interested in {{offer}}";

export const B2B_INBOUND_INQUIRY_FALLBACK_HTML = `<p style="margin:0 0 16px;color:#0f172a;font-size:16px;">Hi ${PRODUCT_NAME} team,</p>
<p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.7;">
  I am <strong style="color:#4f46e5;">{{full_name}}</strong>, {{role}} at <strong>{{company}}</strong>.
  We have been following what Geniteams is building and wanted to reach out about <strong>{{offer}}</strong>.
</p>
<p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.7;">
  {{rationale}} We think there is a strong fit and would love to explore how we could work together.
</p>
<p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.7;">
  Would you have 15 minutes this week for a quick intro call?
</p>
<p style="margin:0;color:#334155;font-size:16px;line-height:1.7;">
  Best regards,<br/>
  <strong>{{full_name}}</strong><br/>
  {{role}} · {{company}}
</p>`;

export const B2B_INBOUND_INQUIRY_NAME = "Inbound Inquiry (LeadScope AI)";
