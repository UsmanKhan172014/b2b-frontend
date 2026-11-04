-- Open sign-up: anyone may create an account and starts on the DEMO plan (1 free run, up to 5 leads).
-- An admin moves people to Standard later. Run after 011.
--
-- Invitations still work (an invited address gets the plan chosen in the invitation) but are no longer required.

drop trigger if exists a_enforce_invite_only on auth.users;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invited_plan text;
  chosen text;
  lim record;
begin
  select plan_type into invited_plan
  from public.invitations
  where lower(email) = lower(new.email) and accepted_at is null and expires_at > now()
  order by created_at desc limit 1;

  chosen := coalesce(invited_plan, 'demo');        -- never anything but demo unless an admin invited them
  select * into lim from public.plan_limits(chosen);

  insert into public.user_profiles
    (user_id, plan_type, role, monthly_lead_limit, lifetime_run_limit, max_leads_per_run)
  values
    (new.id, chosen, 'user', lim.monthly_lead_limit, lim.lifetime_run_limit, lim.max_leads_per_run)
  on conflict (user_id) do nothing;

  update public.invitations set accepted_at = now()
  where lower(email) = lower(new.email) and accepted_at is null;
  return new;
end;
$$;
