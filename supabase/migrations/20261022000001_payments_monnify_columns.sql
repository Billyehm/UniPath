-- Fix-up for databases where 20261022000000_remita_payments.sql was already run:
-- converts the payments table from the Remita shape to the Monnify shape.
-- Run this in the Supabase SQL editor. Do NOT re-run the full monnify migration.

alter table public.payments rename column rrr to reference;
alter table public.payments rename column remita_response to provider_response;
alter table public.payments drop column if exists order_id;
alter table public.payments add column if not exists provider_reference text;
alter table public.payments add column if not exists checkout_url text;
