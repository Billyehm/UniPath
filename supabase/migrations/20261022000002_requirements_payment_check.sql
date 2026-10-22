-- Fix-up: allow 'payment' as a submission type in the table check constraint.
-- Run this in the Supabase SQL editor.

alter table public.requirements drop constraint if exists requirements_submission_type_check;
alter table public.requirements add constraint requirements_submission_type_check check (submission_type in ('file', 'text', 'both', 'payment'));
