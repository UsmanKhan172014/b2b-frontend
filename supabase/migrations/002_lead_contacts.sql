-- Optional contact fields for enriched lead records.

alter table public.leads
  add column if not exists contact_name text,
  add column if not exists contact_title text,
  add column if not exists contact_linkedin text;
