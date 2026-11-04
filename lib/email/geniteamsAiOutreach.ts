import { interpolateVariables } from "@/lib/email/ai-generator";

export const GENITEAMS_AI_OUTREACH_SUBJECT =
  "{{name}}, quick idea on AI for {{company}}";

export const GENITEAMS_AI_OUTREACH_BODY = `{{name}}, Many companies are exploring AI, but few are using it to truly reduce costs and boost productivity.
We help teams leverage AI to:
1- AI chatbots & virtual assistants: automate customer support and internal workflows
2- Predictive analytics: enable smarter, data-driven decisions
3- Generative AI apps: automate content creation and business processes
4- AI Cold Calling Agents: handle outreach, qualify leads, and book meetings so sales can focus on closing
Would you be open to a 15-min quick call? If you want, I can also share our portfolio, pricing for your review.
OR just reply with "YES" and I'll send over a few relevant examples.`;

const SERVICE_ITEMS = [
  {
    number: "1",
    title: "AI chatbots & virtual assistants",
    detail: "automate customer support and internal workflows",
  },
  {
    number: "2",
    title: "Predictive analytics",
    detail: "enable smarter, data-driven decisions",
  },
  {
    number: "3",
    title: "Generative AI apps",
    detail: "automate content creation and business processes",
  },
  {
    number: "4",
    title: "AI Cold Calling Agents",
    detail:
      "handle outreach, qualify leads, and book meetings so sales can focus on closing",
  },
];

function serviceRowsHtml(
  rowStyle: string,
  numberStyle: string,
  titleStyle: string,
  detailStyle: string,
): string {
  return SERVICE_ITEMS.map(
    (item) => `<tr>
      <td style="${numberStyle}">${item.number}-</td>
      <td style="${rowStyle}">
        <strong style="${titleStyle}">${item.title}</strong>:
        <span style="${detailStyle}"> ${item.detail}</span>
      </td>
    </tr>`,
  ).join("");
}

/**
 * Builds the fixed Geniteams AI outreach body with dynamic {{name}} and {{company}}.
 */
export function buildGeniteamsAiOutreachBody(variables: Record<string, string>): string {
  const name = variables.name || "there";

  const intro = interpolateVariables(
    `<p style="margin:0 0 18px;color:#1e293b;font-size:16px;line-height:1.7;">
      <strong style="color:#0f172a;">{{name}}</strong>, Many companies are exploring AI, but few are using it to truly reduce costs and boost productivity.
    </p>
    <p style="margin:0 0 14px;color:#334155;font-size:16px;line-height:1.7;font-weight:600;">
      We help teams leverage AI to:
    </p>`,
    { ...variables, name },
  );

  const services = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
    ${serviceRowsHtml(
      "padding:0 0 12px 0;color:#334155;font-size:15px;line-height:1.65;vertical-align:top;",
      "padding:0 10px 12px 0;color:#4f46e5;font-size:15px;font-weight:700;vertical-align:top;width:28px;",
      "color:#0f172a;",
      "color:#475569;",
    )}
  </table>`;

  const cta = `<p style="margin:0 0 14px;color:#334155;font-size:16px;line-height:1.7;">
      Would you be open to a <strong style="color:#0f172a;">15-min quick call</strong>? If you want, I can also share our portfolio, pricing for your review.
    </p>
    <p style="margin:0;color:#334155;font-size:16px;line-height:1.7;">
      OR just reply with <strong style="color:#059669;">"YES"</strong> and I'll send over a few relevant examples.
    </p>`;

  return intro + services + cta;
}

export function getGeniteamsAiOutreachPlainPreview(variables: Record<string, string>): string {
  return interpolateVariables(GENITEAMS_AI_OUTREACH_BODY, variables);
}
