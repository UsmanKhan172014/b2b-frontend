-- User profiles with optional research run limits (demo accounts).

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_type text not null default 'standard',
  research_runs_limit integer,
  created_at timestamptz not null default now(),
  constraint user_profiles_plan_type_check check (
    plan_type in ('standard', 'demo')
  )
);

comment on column public.user_profiles.research_runs_limit is
  'Max research sessions allowed. NULL means unlimited (standard plans).';

alter table public.user_profiles enable row level security;

drop policy if exists "Users can view own profile" on public.user_profiles;
create policy "Users can view own profile"
  on public.user_profiles
  for select
  using (auth.uid() = user_id);

-- Default profile for new signups (unlimited research).
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, plan_type, research_runs_limit)
  values (new.id, 'standard', null)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

-- Backfill profiles for existing users.
insert into public.user_profiles (user_id, plan_type, research_runs_limit)
select id, 'standard', null
from auth.users
on conflict (user_id) do nothing;

-- Enforce research session limit at the database layer.
create or replace function public.enforce_research_session_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  run_limit integer;
  run_count integer;
begin
  select research_runs_limit
  into run_limit
  from public.user_profiles
  where user_id = new.user_id;

  if run_limit is null then
    return new;
  end if;

  select count(*)::integer
  into run_count
  from public.research_sessions
  where user_id = new.user_id;

  if run_count >= run_limit then
    raise exception 'RESEARCH_LIMIT_REACHED'
      using errcode = 'P0001',
        hint = format('Demo accounts are limited to %s research runs.', run_limit);
  end if;

  return new;
end;
$$;

drop trigger if exists research_sessions_limit_check on public.research_sessions;
create trigger research_sessions_limit_check
  before insert on public.research_sessions
  for each row
  execute function public.enforce_research_session_limit();
