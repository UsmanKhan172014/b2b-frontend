-- LeadScope AI: research sessions and leads with row-level security.

create table if not exists public.research_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  brief jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint research_sessions_status_check check (
    status in ('pending', 'running', 'completed', 'failed')
  )
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.research_sessions (id) on delete cascade,
  company_name text not null,
  website text not null default '',
  industry text not null default '',
  size_estimate text not null default '',
  region text,
  signal text,
  confidence_score numeric(5, 2),
  source_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_research_sessions_user_id
  on public.research_sessions (user_id);

create index if not exists idx_research_sessions_created_at
  on public.research_sessions (created_at desc);

create index if not exists idx_leads_session_id
  on public.leads (session_id);

create index if not exists idx_leads_confidence_score
  on public.leads (confidence_score desc nulls last);

alter table public.research_sessions enable row level security;
alter table public.leads enable row level security;

create policy "Users can view own research sessions"
  on public.research_sessions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own research sessions"
  on public.research_sessions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own research sessions"
  on public.research_sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own research sessions"
  on public.research_sessions
  for delete
  using (auth.uid() = user_id);

create policy "Users can view leads for own sessions"
  on public.leads
  for select
  using (
    exists (
      select 1
      from public.research_sessions
      where research_sessions.id = leads.session_id
        and research_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert leads for own sessions"
  on public.leads
  for insert
  with check (
    exists (
      select 1
      from public.research_sessions
      where research_sessions.id = leads.session_id
        and research_sessions.user_id = auth.uid()
    )
  );

create policy "Users can update leads for own sessions"
  on public.leads
  for update
  using (
    exists (
      select 1
      from public.research_sessions
      where research_sessions.id = leads.session_id
        and research_sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.research_sessions
      where research_sessions.id = leads.session_id
        and research_sessions.user_id = auth.uid()
    )
  );

create policy "Users can delete leads for own sessions"
  on public.leads
  for delete
  using (
    exists (
      select 1
      from public.research_sessions
      where research_sessions.id = leads.session_id
        and research_sessions.user_id = auth.uid()
    )
  );
