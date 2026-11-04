import { GoogleGenAI } from "@google/genai";

const DEFAULT_EMAIL_MODEL = "gemini-2.5-flash";

function getGeminiApiKey(): string {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || "";

  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY (or GOOGLE_API_KEY). Set it in .env.local for email generation.",
    );
  }

  return apiKey;
}

function getEmailModel(): string {
  return process.env.EMAIL_MODEL?.trim() || DEFAULT_EMAIL_MODEL;
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getGeminiApiKey() });
}

/**
 * Replaces dynamic variables like {{name}} with actual context values.
 */
export function interpolateVariables(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? "");
}

/**
 * Strips markdown code fences that LLMs sometimes wrap around HTML.
 */
export function cleanAiHtml(rawContent: string): string {
  return rawContent
    .replace(/^```html\s*/gi, "")
    .replace(/^```\s*/gi, "")
    .replace(/\s*```$/gi, "")
    .trim();
}

/**
 * Generates clean HTML email content using Gemini.
 */
export async function generateEmailBody(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: getEmailModel(),
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    },
  });

  const rawContent = response.text?.trim() || "<p>Content generation failed.</p>";
  return cleanAiHtml(rawContent);
}
