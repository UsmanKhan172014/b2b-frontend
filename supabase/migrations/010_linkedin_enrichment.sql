-- LinkedIn session cookies + lead profile enrichment fields.

create table if not exists public.linkedin_cookies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cookies jsonb not null default '[]'::jsonb,
  email text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint linkedin_cookies_user_unique unique (user_id)
);

create index if not exists idx_linkedin_cookies_user_id
  on public.linkedin_cookies (user_id);

alter table public.linkedin_cookies enable row level security;

-- Users can see connection status metadata only via controlled API;
-- cookie JSON is still protected: no direct client select of cookies column
-- in app code. Policies allow select/delete of own row for status UI.
drop policy if exists "Users can view own linkedin cookie row" on public.linkedin_cookies;
create policy "Users can view own linkedin cookie row"
  on public.linkedin_cookies
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own linkedin cookie row" on public.linkedin_cookies;
create policy "Users can delete own linkedin cookie row"
  on public.linkedin_cookies
  for delete
  using (auth.uid() = user_id);

-- Inserts/updates are done by the agent service with the service role key.
-- Authenticated users cannot write cookie blobs from the browser.

create table if not exists public.linkedin_profile_cache (
  id uuid primary key default gen_random_uuid(),
  profile_url text not null,
  name text not null default '',
  subtitle text not null default '',
  location text not null default '',
  about text not null default '',
  experience jsonb not null default '[]'::jsonb,
  education jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  scraped_at timestamptz not null default now(),
  constraint linkedin_profile_cache_url_unique unique (profile_url)
);

create index if not exists idx_linkedin_profile_cache_url
  on public.linkedin_profile_cache (profile_url);

-- Server-only table: the agent service writes/reads it with the service role
-- key, which bypasses RLS. Enabling RLS with no policies means browser clients
-- using anon/authenticated keys get no access at all.
alter table public.linkedin_profile_cache enable row level security;

-- Enrichment columns on leads (only if the table already exists from 001_init.sql)
do $$
begin
  if to_regclass('public.leads') is null then
    raise exception
      'public.leads does not exist. Run 001_init.sql (and later migrations) on this project first, or confirm you selected the correct Supabase project.';
  end if;

  alter table public.leads
    add column if not exists linkedin_about text,
    add column if not exists linkedin_experience jsonb,
    add column if not exists linkedin_education jsonb,
    add column if not exists linkedin_skills jsonb,
    add column if not exists linkedin_subtitle text,
    add column if not exists linkedin_location text;
end $$;

