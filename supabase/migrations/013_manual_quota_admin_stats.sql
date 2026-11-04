-- Quota does NOT reset by itself: usage counts from `quota_started_at`, and only an admin starts a new period
-- (or raises the limit). Also adds per-user totals and a month-by-month history for the admin page.
-- Run after 011 and 012.

alter table public.user_profiles
  add column if not exists quota_started_at timestamptz not null default now();

-- First run: keep whatever each person has used so far this calendar month.
do $$
begin
  if not exists (select 1 from public.admin_audit_log where action = 'quota_period_migrated') then
    update public.user_profiles
    set quota_started_at = (date_trunc('month', now() at time zone 'utc')) at time zone 'utc';
    insert into public.admin_audit_log (action, details) values ('quota_period_migrated', '{}'::jsonb);
  end if;
end $$;

create or replace function public.usage_snapshot(p_user uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  prof public.user_profiles%rowtype;
  period_start timestamptz;
  used integer;
  runs_used integer;
  quota_left integer;
  runs_left integer;
  reason text;
  allowed integer;
begin
  select * into prof from public.user_profiles where user_id = p_user;
  if not found then
    return jsonb_build_object('blocked_reason', 'no_profile', 'allowed_now', 0);
  end if;
  period_start := prof.quota_started_at;

  select coalesce(sum(case when status = 'settled' then delivered else requested end), 0)::integer
  into used
  from public.lead_usage
  where user_id = p_user and created_at >= period_start
    and (status = 'settled' or (status = 'reserved' and created_at > now() - interval '3 hours'));

  -- demo run allowance counts every run ever; it is not period based
  select count(*)::integer into runs_used
  from public.lead_usage
  where user_id = p_user
    and ((status = 'settled' and delivered > 0)
         or (status = 'reserved' and created_at > now() - interval '3 hours'));

  quota_left := case when prof.monthly_lead_limit is null then null
                     else greatest(0, prof.monthly_lead_limit - used) end;
  runs_left := case when prof.lifetime_run_limit is null then null
                    else greatest(0, prof.lifetime_run_limit - runs_used) end;

  reason := case
    when not prof.is_active then 'inactive'
    when runs_left is not null and runs_left <= 0 then 'run_limit'
    when quota_left is not null and quota_left <= 0 then 'monthly_limit'
    else null end;

  allowed := case when reason is not null then 0
                  else least(prof.max_leads_per_run, coalesce(quota_left, prof.max_leads_per_run)) end;

  return jsonb_build_object(
    'plan_type', prof.plan_type,
    'role', prof.role,
    'is_active', prof.is_active,
    'monthly_limit', prof.monthly_lead_limit,
    'monthly_used', used,
    'monthly_remaining', quota_left,
    'run_limit', prof.lifetime_run_limit,
    'runs_used', runs_used,
    'runs_remaining', runs_left,
    'max_leads_per_run', prof.max_leads_per_run,
    'allowed_now', allowed,
    'blocked_reason', reason,
    'period_started_at', period_start,
    'resets_at', null
  );
end;
$$;

revoke execute on function public.usage_snapshot(uuid) from public, anon, authenticated;
grant execute on function public.usage_snapshot(uuid) to service_role;

-- Totals per person, all time.
create or replace function public.admin_usage_totals()
returns table (user_id uuid, total_runs integer, total_leads integer, last_run_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select u.user_id,
         count(*) filter (where u.status = 'settled' and u.delivered > 0)::integer,
         coalesce(sum(u.delivered) filter (where u.status = 'settled'), 0)::integer,
         max(u.created_at) filter (where u.status = 'settled' and u.delivered > 0)
  from public.lead_usage u
  group by u.user_id;
$$;

-- One person's history, month by month.
create or replace function public.admin_usage_by_month(p_user uuid)
returns table (month date, runs integer, leads integer)
language sql
stable
security definer
set search_path = public
as $$
  select date_trunc('month', created_at at time zone 'utc')::date,
         count(*) filter (where delivered > 0)::integer,
         coalesce(sum(delivered), 0)::integer
  from public.lead_usage
  where user_id = p_user and status = 'settled'
  group by 1
  order by 1 desc;
$$;

revoke execute on function public.admin_usage_totals() from public, anon, authenticated;
revoke execute on function public.admin_usage_by_month(uuid) from public, anon, authenticated;
grant execute on function public.admin_usage_totals() to service_role;
grant execute on function public.admin_usage_by_month(uuid) to service_role;
