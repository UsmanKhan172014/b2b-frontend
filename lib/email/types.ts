export type EmailContentMode = "ai" | "fixed";

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject_template: string;
  system_prompt: string;
  user_prompt_template: string;
  fallback_html: string | null;
  layout_variant?: string | null;
  content_mode?: EmailContentMode | null;
  created_at: string;
}

export interface SendDynamicEmailPayload {
  templateSlug: string;
  recipientEmail: string;
  variables: Record<string, string>;
}

export interface SendDynamicEmailResult {
  messageId: string;
  subject: string;
  usedFallback: boolean;
  htmlPreview: string;
}
