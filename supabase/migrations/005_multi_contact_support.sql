-- Multi-contact-per-company support: group multiple decision-makers found at
-- the same company together, mark which one is the primary/best match, and
-- record LinkedIn verification trust tier (first-party company-site scrape,
-- search-context-corroborated match, name-only unverified match, or none).

alter table public.leads
  add column if not exists company_group_id text,
  add column if not exists is_primary_contact boolean not null default true,
  add column if not exists contact_rank integer not null default 1,
  add column if not exists linkedin_status text;

-- Backfill company_group_id for existing rows so grouping works immediately
-- on data written before this migration (one row per company, so each is its
-- own group and already the primary).
update public.leads
set company_group_id = lower(regexp_replace(trim(company_name), '\s+', ' ', 'g'))
where company_group_id is null;

create index if not exists leads_company_group_id_idx on public.leads (company_group_id);