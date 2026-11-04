-- Upgrade for databases that already ran the original 006_email_campaigns.sql.
-- Run THIS file if 006 was already applied and you need new templates / columns.
-- Do NOT re-run 006 — tables and policies already exist.

-- 1) Add new columns for template design + fixed/AI content mode
alter table public.email_templates
  add column if not exists layout_variant text;

alter table public.email_templates
  add column if not exists content_mode text;

update public.email_templates
set content_mode = 'ai'
where content_mode is null;

alter table public.email_templates
  alter column content_mode set default 'ai';

alter table public.email_templates
  alter column content_mode set not null;

alter table public.email_templates
  drop constraint if exists email_templates_content_mode_check;

alter table public.email_templates
  add constraint email_templates_content_mode_check
  check (content_mode in ('ai', 'fixed'));

-- 2) Upgrade existing B2B template to inbound inquiry style
update public.email_templates
set
  name = 'Inbound Inquiry (LeadScope AI)',
  subject_template = 'Re: {{full_name}} from {{company}} — interested in {{offer}}',
  system_prompt = 'You are an expert B2B copywriter for LeadScope AI by Geniteams. Write a short inbound inquiry email in clean HTML using inline styles only. Do not wrap output in markdown code fences. Do not include outer html/head/body tags. Write in FIRST PERSON as the prospect reaching OUT to the LeadScope AI team at Geniteams. Sound genuinely interested and specific. Keep under 140 words. Sign off with their name, role, and company.',
  user_prompt_template = 'Write an inbound inquiry email AS {{full_name}} ({{role}} at {{company}}) TO the LeadScope AI team at Geniteams. They are interested in: {{offer}}. Reason for reaching out: {{rationale}}. The message should feel like THEY sent this email to us. Include a brief call-to-action. Sign off as {{full_name}}, {{role}}, {{company}}.',
  fallback_html = '<p style="margin:0 0 16px;color:#0f172a;font-size:16px;">Hi LeadScope AI team,</p><p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.7;">I am <strong style="color:#4f46e5;">{{full_name}}</strong>, {{role}} at <strong>{{company}}</strong>. We wanted to reach out about <strong>{{offer}}</strong>.</p><p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.7;">{{rationale}} We would love to explore a quick intro call this week.</p><p style="margin:0;color:#334155;font-size:16px;line-height:1.7;">Best regards,<br/><strong>{{full_name}}</strong><br/>{{role}} · {{company}}</p>',
  layout_variant = 'inbound',
  content_mode = 'ai'
where slug = 'b2b_cold_outreach';

-- 3) Add Geniteams AI fixed-copy templates (4 HTML designs)
insert into public.email_templates (
  slug,
  name,
  subject_template,
  system_prompt,
  user_prompt_template,
  fallback_html,
  layout_variant,
  content_mode
)
values
(
  'geniteams_ai_classic',
  'Geniteams AI Outreach — Classic',
  '{{name}}, quick idea on AI for {{company}}',
  '',
  '',
  null,
  'classic',
  'fixed'
),
(
  'geniteams_ai_modern',
  'Geniteams AI Outreach — Modern Gradient',
  '{{name}}, quick idea on AI for {{company}}',
  '',
  '',
  null,
  'modern',
  'fixed'
),
(
  'geniteams_ai_bold',
  'Geniteams AI Outreach — Bold Dark',
  '{{name}}, quick idea on AI for {{company}}',
  '',
  '',
  null,
  'bold',
  'fixed'
),
(
  'geniteams_ai_minimal',
  'Geniteams AI Outreach — Clean Minimal',
  '{{name}}, quick idea on AI for {{company}}',
  '',
  '',
  null,
  'minimal',
  'fixed'
)
on conflict (slug) do update
set
  name = excluded.name,
  subject_template = excluded.subject_template,
  system_prompt = excluded.system_prompt,
  user_prompt_template = excluded.user_prompt_template,
  fallback_html = excluded.fallback_html,
  layout_variant = excluded.layout_variant,
  content_mode = excluded.content_mode;

-- 4) Default new campaigns to Geniteams Classic (existing drafts keep their slug)
alter table public.campaigns
  alter column template_slug set default 'geniteams_ai_classic';
