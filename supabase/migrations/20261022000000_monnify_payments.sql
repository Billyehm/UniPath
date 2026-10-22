-- Monnify payments, payment-type requirements, and requirement reordering.

-- Payment attempts (one row per Monnify payment reference).
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  requirement_id text references public.requirements(id) on delete set null,
  reference text not null unique,
  provider_reference text,
  checkout_url text,
  amount_kobo integer not null check (amount_kobo > 0),
  status text not null default 'pending' check (status in ('pending', 'successful', 'failed')),
  payer_name text,
  payer_email text,
  payer_phone text,
  provider_response jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_user_id_idx on public.payments(user_id);

-- Amount (in kobo) for payment-type requirements, set by admins.
alter table public.requirements
  add column if not exists amount_kobo integer check (amount_kobo is null or amount_kobo > 0);

alter table public.payments enable row level security;
create policy "owners view own payments" on public.payments
  for select to authenticated using (user_id = (select auth.uid()));
create policy "owners create own payments" on public.payments
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "owners update own payments" on public.payments
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Accept 'payment' as a submission type, with a required amount.
drop function if exists public.create_requirement(text, text, text, text);
create or replace function public.create_requirement(
  requirement_title text,
  requirement_subtitle text,
  requirement_guidance text,
  requirement_submission_type text,
  requirement_amount_kobo integer default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare new_requirement_id text;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if char_length(trim(requirement_title)) not between 2 and 140 or char_length(trim(requirement_subtitle)) not between 2 and 500 then raise exception 'Title or subtitle is invalid'; end if;
  if requirement_submission_type not in ('file', 'text', 'both', 'payment') then raise exception 'Submission type is invalid'; end if;
  if requirement_submission_type = 'payment' and (requirement_amount_kobo is null or requirement_amount_kobo <= 0) then raise exception 'Payment requirements need an amount'; end if;
  new_requirement_id := concat('req-', floor(extract(epoch from clock_timestamp()) * 1000)::bigint, '-', floor(random() * 1000000)::bigint);
  insert into public.requirements (id, title, description, guidance, submission_type, amount_kobo, display_order)
  values (new_requirement_id, trim(requirement_title), trim(requirement_subtitle), nullif(trim(requirement_guidance), ''), requirement_submission_type, requirement_amount_kobo, coalesce((select max(display_order) + 1 from public.requirements), 0));
  insert into public.user_requirements (user_id, requirement_id)
  select id, new_requirement_id from public.users where role = 'applicant' on conflict (user_id, requirement_id) do nothing;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id) values (auth.uid(), 'requirement.created', 'requirement', new_requirement_id);
  return new_requirement_id;
end;
$$;

drop function if exists public.update_requirement(text, text, text, text, text);
create or replace function public.update_requirement(
  requirement_id text,
  requirement_title text,
  requirement_subtitle text,
  requirement_guidance text,
  requirement_submission_type text,
  requirement_amount_kobo integer default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if char_length(trim(requirement_title)) not between 2 and 140 or char_length(trim(requirement_subtitle)) not between 2 and 500 then raise exception 'Title or subtitle is invalid'; end if;
  if requirement_submission_type not in ('file', 'text', 'both', 'payment') then raise exception 'Submission type is invalid'; end if;
  if requirement_submission_type = 'payment' and (requirement_amount_kobo is null or requirement_amount_kobo <= 0) then raise exception 'Payment requirements need an amount'; end if;
  update public.requirements
  set title = trim(requirement_title),
      description = trim(requirement_subtitle),
      guidance = nullif(trim(requirement_guidance), ''),
      submission_type = requirement_submission_type,
      amount_kobo = requirement_amount_kobo,
      updated_at = now()
  where id = requirement_id;
  if not found then raise exception 'Requirement not found'; end if;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id) values (auth.uid(), 'requirement.updated', 'requirement', requirement_id);
  return requirement_id;
end;
$$;

revoke all on function public.create_requirement(text, text, text, text, integer) from public;
grant execute on function public.create_requirement(text, text, text, text, integer) to authenticated;
revoke all on function public.update_requirement(text, text, text, text, text, integer) from public;
grant execute on function public.update_requirement(text, text, text, text, text, integer) to authenticated;

-- Reorder checklist steps: display_order follows the array position.
create or replace function public.reorder_requirements(requirement_ids text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  update public.requirements r
  set display_order = ord.pos, updated_at = now()
  from (select value as id, ordinality as pos from unnest(requirement_ids) with ordinality) ord
  where r.id = ord.id;
end;
$$;

revoke all on function public.reorder_requirements(text[]) from public;
grant execute on function public.reorder_requirements(text[]) to authenticated;
