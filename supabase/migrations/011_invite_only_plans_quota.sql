-- Invite-only access, admin-managed plans, per-month lead quota, shared rate limiter.
--
-- Run in the Supabase SQL editor after 010. Safe to re-run.
--
-- Security model
--   * Nobody writes these tables from the browser: RLS is on, there are no write policies, and write
--     privileges are revoked. Only the service role (server-side) changes plans, invitations and usage.
--   * Sign-ups are blocked at the database (trigger on auth.users), so turning the public sign-up
--     setting off in the dashboard is not the only thing standing between the internet and an account.
--   * Usage is recorded by the backend from the verified token, not by the browser.

-- ---------------------------------------------------------------------------------------------- profiles

-- First run only: add the limit columns and put existing accounts on their plan's limits. Guarded so
-- re-running this file never overwrites limits an admin has set since.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'monthly_lead_limit'
  ) then
    alter table public.user_profiles
      add column monthly_lead_limit integer,                    -- NULL = no monthly cap
      add column lifetime_run_limit integer,                    -- NULL = no cap on the number of runs (demo = 1)
      add column max_leads_per_run integer not null default 25;
    update public.user_profiles
    set monthly_lead_limit = case when plan_type = 'demo' then null else 100 end,
        lifetime_run_limit = case when plan_type = 'demo' then 1 else null end,
        max_leads_per_run  = case when plan_type = 'demo' then 5 else 25 end;
  end if;
end $$;

alter table public.user_profiles
  add column if not exists role text not null default 'user',
  add column if not exists is_active boolean not null default true;

alter table public.user_profiles drop constraint if exists user_profiles_role_check;
alter table public.user_profiles
  add constraint user_profiles_role_check check (role in ('user', 'admin'));

alter table public.user_profiles drop constraint if exists user_profiles_plan_type_check;
alter table public.user_profiles
  add constraint user_profiles_plan_type_check check (plan_type in ('demo', 'standard'));

alter table public.user_profiles drop constraint if exists user_profiles_limits_check;
alter table public.user_profiles
  add constraint user_profiles_limits_check check (
    max_leads_per_run between 1 and 25
    and (monthly_lead_limit is null or monthly_lead_limit >= 0)
    and (lifetime_run_limit is null or lifetime_run_limit >= 0)
  );

comment on column public.user_profiles.research_runs_limit is
  'Deprecated. Replaced by lifetime_run_limit / monthly_lead_limit.';

-- The two plans an admin can hand out. One place, so the trigger and the admin API cannot drift apart.
create or replace function public.plan_limits(p_plan text)
returns table (monthly_lead_limit integer, lifetime_run_limit integer, max_leads_per_run integer)
language sql
immutable
as $$
  select case when p_plan = 'demo' then null else 100 end,
         case when p_plan = 'demo' then 1 else null end,
         case when p_plan = 'demo' then 5 else 25 end;
$$;

-- Users may read their own profile and nothing else; no one can write from the client.
revoke insert, update, delete on public.user_profiles from anon, authenticated;
drop policy if exists "Users can view own profile" on public.user_profiles;
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------------------- invitations

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  plan_type text not null default 'demo' check (plan_type in ('demo', 'standard')),
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz
);

create unique index if not exists invitations_open_email_key
  on public.invitations (lower(email)) where accepted_at is null;

alter table public.invitations enable row level security;
revoke all on public.invitations from anon, authenticated;       -- service role only

-- No invitation, no account. Applies to every way of creating a user (password, OAuth, magic link, API).
create or replace function public.enforce_invite_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null or not exists (
    select 1 from public.invitations
    where lower(email) = lower(new.email) and accepted_at is null and expires_at > now()
  ) then
    raise exception 'Sign-ups are by invitation only' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists a_enforce_invite_only on auth.users;
create trigger a_enforce_invite_only
  before insert on auth.users
  for each row execute function public.enforce_invite_only();

-- New user: profile with the invited plan's limits, invitation marked used.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invited_plan text;
  lim record;
begin
  select plan_type into invited_plan
  from public.invitations
  where lower(email) = lower(new.email) and accepted_at is null
  order by created_at desc limit 1;

  invited_plan := coalesce(invited_plan, 'demo');                 -- least privilege if anything is odd
  select * into lim from public.plan_limits(invited_plan);

  insert into public.user_profiles
    (user_id, plan_type, role, monthly_lead_limit, lifetime_run_limit, max_leads_per_run)
  values
    (new.id, invited_plan, 'user', lim.monthly_lead_limit, lim.lifetime_run_limit, lim.max_leads_per_run)
  on conflict (user_id) do nothing;

  update public.invitations set accepted_at = now()
  where lower(email) = lower(new.email) and accepted_at is null;
  return new;
end;
$$;

-- ----------------------------------------------------------------------------------------------- usage

create table if not exists public.lead_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  requested integer not null check (requested > 0),
  delivered integer check (delivered is null or delivered >= 0),
  status text not null default 'reserved' check (status in ('reserved', 'settled', 'released')),
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create index if not exists lead_usage_user_created_idx on public.lead_usage (user_id, created_at desc);

alter table public.lead_usage enable row level security;
revoke insert, update, delete on public.lead_usage from anon, authenticated;
drop policy if exists "Users can view own usage" on public.lead_usage;
create policy "Users can view own usage" on public.lead_usage for select using (auth.uid() = user_id);

-- Where a user stands right now. A run that is still going counts at its reserved size; one that never
-- finished (server crash) stops counting after three hours; a run that delivered nothing counts for nothing.
create or replace function public.usage_snapshot(p_user uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  prof public.user_profiles%rowtype;
  month_start timestamptz := (date_trunc('month', now() at time zone 'utc')) at time zone 'utc';
  month_used integer;
  runs_used integer;
  month_left integer;
  runs_left integer;
  reason text;
  allowed integer;
begin
  select * into prof from public.user_profiles where user_id = p_user;
  if not found then
    return jsonb_build_object('blocked_reason', 'no_profile', 'allowed_now', 0);
  end if;

  select coalesce(sum(case when status = 'settled' then delivered else requested end), 0)::integer
  into month_used
  from public.lead_usage
  where user_id = p_user and created_at >= month_start
    and (status = 'settled' or (status = 'reserved' and created_at > now() - interval '3 hours'));

  select count(*)::integer into runs_used
  from public.lead_usage
  where user_id = p_user
    and ((status = 'settled' and delivered > 0)
         or (status = 'reserved' and created_at > now() - interval '3 hours'));

  month_left := case when prof.monthly_lead_limit is null then null
                     else greatest(0, prof.monthly_lead_limit - month_used) end;
  runs_left := case when prof.lifetime_run_limit is null then null
                    else greatest(0, prof.lifetime_run_limit - runs_used) end;

  reason := case
    when not prof.is_active then 'inactive'
    when runs_left is not null and runs_left <= 0 then 'run_limit'
    when month_left is not null and month_left <= 0 then 'monthly_limit'
    else null end;

  allowed := case when reason is not null then 0
                  else least(prof.max_leads_per_run, coalesce(month_left, prof.max_leads_per_run)) end;

  return jsonb_build_object(
    'plan_type', prof.plan_type,
    'role', prof.role,
    'is_active', prof.is_active,
    'monthly_limit', prof.monthly_lead_limit,
    'monthly_used', month_used,
    'monthly_remaining', month_left,
    'run_limit', prof.lifetime_run_limit,
    'runs_used', runs_used,
    'runs_remaining', runs_left,
    'max_leads_per_run', prof.max_leads_per_run,
    'allowed_now', allowed,
    'blocked_reason', reason,
    'resets_at', month_start + interval '1 month'
  );
end;
$$;

revoke execute on function public.usage_snapshot(uuid) from public, anon, authenticated;
grant execute on function public.usage_snapshot(uuid) to service_role;

-- The signed-in user's own numbers (never anyone else's).
create or replace function public.get_my_usage()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select public.usage_snapshot(auth.uid());
$$;

revoke execute on function public.get_my_usage() from public, anon;
grant execute on function public.get_my_usage() to authenticated;

-- Backend: reserve the leads for a run before it starts. Serialised per user so two requests cannot
-- both squeeze through the last of the allowance.
create or replace function public.reserve_research_run(p_user uuid, p_requested integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  snap jsonb;
  granted integer;
  rid uuid;
begin
  perform pg_advisory_xact_lock(hashtext(p_user::text));
  snap := public.usage_snapshot(p_user);
  granted := least(greatest(coalesce(p_requested, 1), 1), coalesce((snap ->> 'allowed_now')::integer, 0));

  if granted <= 0 then
    return snap || jsonb_build_object('ok', false, 'granted', 0);
  end if;

  insert into public.lead_usage (user_id, requested) values (p_user, granted) returning id into rid;
  return snap || jsonb_build_object('ok', true, 'granted', granted, 'reservation_id', rid);
end;
$$;

revoke execute on function public.reserve_research_run(uuid, integer) from public, anon, authenticated;
grant execute on function public.reserve_research_run(uuid, integer) to service_role;

-- Backend: charge for what was actually delivered. Delivering nothing gives the allowance back.
create or replace function public.settle_research_run(p_reservation uuid, p_delivered integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.lead_usage
  set delivered = least(greatest(coalesce(p_delivered, 0), 0), requested),
      status = case when least(greatest(coalesce(p_delivered, 0), 0), requested) = 0 then 'released' else 'settled' end,
      settled_at = now()
  where id = p_reservation and status = 'reserved';
  get diagnostics n = row_count;
end;
$$;

revoke execute on function public.settle_research_run(uuid, integer) from public, anon, authenticated;
grant execute on function public.settle_research_run(uuid, integer) to service_role;

-- Defence in depth: the browser creates the session row, so refuse it up front when nothing is left.
create or replace function public.enforce_research_session_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  snap jsonb;
begin
  snap := public.usage_snapshot(new.user_id);
  if coalesce((snap ->> 'allowed_now')::integer, 0) <= 0 then
    raise exception 'RESEARCH_LIMIT_REACHED'
      using errcode = 'P0001', hint = coalesce(snap ->> 'blocked_reason', 'limit');
  end if;
  return new;
end;
$$;

drop trigger if exists research_sessions_limit_check on public.research_sessions;
create trigger research_sessions_limit_check
  before insert on public.research_sessions
  for each row execute function public.enforce_research_session_limit();

-- ------------------------------------------------------------------------------------- shared rate limiter

create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- True while the caller is within `p_max` hits per `p_window_seconds`. Works across serverless instances.
create or replace function public.rate_limit_hit(p_key text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  h integer;
begin
  insert into public.rate_limits as r (key, window_start, hits) values (p_key, w, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning r.hits into h;

  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;
  return h <= p_max;
end;
$$;

revoke execute on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;

-- ------------------------------------------------------------------------------------------- audit log

-- Who invited, changed a plan or disabled an account. Written by the admin API (service role), never by browsers.
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor uuid references auth.users (id) on delete set null,
  action text not null,
  target uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from anon, authenticated;

-- ------------------------------------------------------------------------------------- first admin
-- Promote yourself once, here, with your own email (not from the app):
--   update public.user_profiles set role = 'admin'
--   where user_id = (select id from auth.users where lower(email) = lower('you@example.com'));
