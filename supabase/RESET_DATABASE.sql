-- ============================================================
-- UNIPATH DATABASE RESET - DELETES EVERYTHING. RUN FIRST.
-- ============================================================
-- Run this in Supabase -> SQL editor.
--
-- WARNING: this permanently deletes ALL data in the database:
-- every table, every row, every user account, everything.
-- Only run it if you are sure you want to start completely fresh.
--
-- After this completes, run FULL_SCHEMA.sql to rebuild everything.

-- 1. Drop the entire public schema first: all app tables, functions,
--    types and triggers. Dropping first avoids foreign-key blocks when
--    the user accounts are deleted below.
drop schema public cascade;

-- 2. Wipe all login accounts and everything tied to them (sessions,
--    identities, stored file records). TRUNCATE ... CASCADE bypasses
--    the storage delete-protection trigger and clears every table that
--    references auth.users. No orphaned accounts remain.
truncate auth.users cascade;

-- 3. Recreate the schema with the grants Supabase expects.
create schema public;
grant all on schema public to postgres;
grant all on schema public to anon;
grant all on schema public to authenticated;
grant all on schema public to service_role;
