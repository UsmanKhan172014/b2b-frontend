-- Intentionally empty.
--
-- This migration used to seed a demo user with a password that was committed to the repository.
-- A credential in source control is a leak, so the seed was removed. If you ever applied the old
-- version, the account it created still exists: delete it or change its password in the Supabase
-- dashboard (Authentication > Users).
--
-- Accounts are now created by invitation only (see 011_invite_only_plans_quota.sql).
select 1;
