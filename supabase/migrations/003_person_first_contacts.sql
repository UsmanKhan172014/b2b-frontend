-- Person-first contact fields and Deep Research session metadata.

alter table public.research_sessions
  add column if not exists interaction_id text,
  add column if not exists research_report text;

alter table public.leads
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists contact_whatsapp text,
  add column if not exists contact_confidence text,
  add column if not exists rationale text,
  add column if not exists contact_page_url text;

alter table public.research_sessions
  add column if not exists pipeline_metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_research_sessions_interaction_id
  on public.research_sessions (interaction_id);
