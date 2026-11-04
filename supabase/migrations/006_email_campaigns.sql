-- Email templates, campaigns, and campaign recipients for outreach.
-- NOTE: If you already ran an older version of this migration, do NOT re-run this file.
-- Use 007_upgrade_email_templates.sql instead to add new templates and columns.

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  subject_template text not null,
  system_prompt text not null,
  user_prompt_template text not null,
  fallback_html text,
  layout_variant text,
  content_mode text not null default 'ai',
  created_at timestamptz not null default now(),
  constraint email_templates_content_mode_check check (content_mode in ('ai', 'fixed'))
);

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
  'b2b_cold_outreach',
  'Inbound Inquiry (LeadScope AI)',
  'Re: {{full_name}} from {{company}} — interested in {{offer}}',
  'You are an expert B2B copywriter for LeadScope AI by Geniteams. Write a short inbound inquiry email in clean HTML using inline styles only. Do not wrap output in markdown code fences. Do not include outer html/head/body tags. Write in FIRST PERSON as the prospect reaching OUT to the LeadScope AI team at Geniteams. Sound genuinely interested and specific. Keep under 140 words. Sign off with their name, role, and company.',
  'Write an inbound inquiry email AS {{full_name}} ({{role}} at {{company}}) TO the LeadScope AI team at Geniteams. They are interested in: {{offer}}. Reason for reaching out: {{rationale}}. The message should feel like THEY sent this email to us. Include a brief call-to-action. Sign off as {{full_name}}, {{role}}, {{company}}.',
  '<p style="margin:0 0 16px;color:#0f172a;font-size:16px;">Hi LeadScope AI team,</p><p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.7;">I am <strong style="color:#4f46e5;">{{full_name}}</strong>, {{role}} at <strong>{{company}}</strong>. We wanted to reach out about <strong>{{offer}}</strong>.</p><p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.7;">{{rationale}} We would love to explore a quick intro call this week.</p><p style="margin:0;color:#334155;font-size:16px;line-height:1.7;">Best regards,<br/><strong>{{full_name}}</strong><br/>{{role}} · {{company}}</p>',
  'inbound',
  'ai'
),
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
),
(
  'welcome_email',
  'Welcome Email',
  'Welcome aboard, {{name}}!',
  'You are an expert copywriter. Generate a friendly, concise welcome email body in clean HTML. Do not wrap output in markdown code fences. Use inline styles suitable for email clients.',
  'Write a welcome email for {{name}} who just joined {{company}} as a {{role}}.',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;"><h1 style="color: #111;">Welcome, {{name}}!</h1><p>We are thrilled to have you join {{company}} as {{role}}.</p></div>',
  null,
  'ai'
)
on conflict (slug) do nothing;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  objective text not null default 'demo',
  tone integer not null default 75,
  template_slug text not null default 'geniteams_ai_classic',
  status text not null default 'draft',
  source_session_id uuid references public.research_sessions (id) on delete set null,
  selected_lead_ids uuid[] not null default '{}',
  channels jsonb not null default '{"email": true, "linkedin": false}'::jsonb,
  email_steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  launched_at timestamptz,
  constraint campaigns_status_check check (
    status in ('draft', 'sending', 'completed', 'failed')
  ),
  constraint campaigns_objective_check check (
    objective in ('demo', 'webinar', 'newsletter')
  )
);

create table if not exists public.campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  recipient_email text not null,
  variables jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  message_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint campaign_recipients_status_check check (
    status in ('pending', 'sent', 'failed', 'skipped')
  )
);

create index if not exists idx_campaigns_user_id
  on public.campaigns (user_id);

create index if not exists idx_campaigns_created_at
  on public.campaigns (created_at desc);

create index if not exists idx_campaign_recipients_campaign_id
  on public.campaign_recipients (campaign_id);

alter table public.email_templates enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_recipients enable row level security;

drop policy if exists "Authenticated users can read email templates" on public.email_templates;
create policy "Authenticated users can read email templates"
  on public.email_templates
  for select
  to authenticated
  using (true);

drop policy if exists "Users can view own campaigns" on public.campaigns;
create policy "Users can view own campaigns"
  on public.campaigns
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own campaigns" on public.campaigns;
create policy "Users can insert own campaigns"
  on public.campaigns
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own campaigns" on public.campaigns;
create policy "Users can update own campaigns"
  on public.campaigns
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own campaigns" on public.campaigns;
create policy "Users can delete own campaigns"
  on public.campaigns
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view recipients for own campaigns" on public.campaign_recipients;
create policy "Users can view recipients for own campaigns"
  on public.campaign_recipients
  for select
  using (
    exists (
      select 1
      from public.campaigns
      where campaigns.id = campaign_recipients.campaign_id
        and campaigns.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert recipients for own campaigns" on public.campaign_recipients;
create policy "Users can insert recipients for own campaigns"
  on public.campaign_recipients
  for insert
  with check (
    exists (
      select 1
      from public.campaigns
      where campaigns.id = campaign_recipients.campaign_id
        and campaigns.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update recipients for own campaigns" on public.campaign_recipients;
create policy "Users can update recipients for own campaigns"
  for update
  using (
    exists (
      select 1
      from public.campaigns
      where campaigns.id = campaign_recipients.campaign_id
        and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.campaigns
      where campaigns.id = campaign_recipients.campaign_id
        and campaigns.user_id = auth.uid()
    )
  );
