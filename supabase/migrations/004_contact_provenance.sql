-- Contact type, company-level channels, and per-field source URLs.

alter table public.leads
  add column if not exists contact_type text,
  add column if not exists company_email text,
  add column if not exists company_phone text,
  add column if not exists email_source_url text,
  add column if not exists phone_source_url text,
  add column if not exists resolution_channel text;
