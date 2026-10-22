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

-- 2. Clear stored file records so account deletion is not blocked.
delete from storage.objects;

-- 3. Delete all login accounts (no orphaned auth users remain).
delete from auth.users;

-- 3. Recreate the schema with the grants Supabase expects.
create schema public;
grant all on schema public to postgres;
grant all on schema public to anon;
grant all on schema public to authenticated;
grant all on schema public to service_role;
