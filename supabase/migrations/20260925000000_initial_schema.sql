-- Complete initial schema for a brand-new Supabase project.
-- Apply once with `supabase db push`, or paste this entire file into the Supabase SQL Editor.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'support_agent', 'applicant');
create type public.ticket_status as enum ('open', 'pending', 'resolved');
create type public.ticket_priority as enum ('low', 'normal', 'high', 'urgent');
create type public.review_status as enum ('pending', 'approved', 'rejected', 'resubmission_requested');

create table public.roles (
  id smallint generated always as identity primary key,
  name public.app_role not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

insert into public.roles (name, description) values
  ('admin', 'Full access to administration, reviews, support and audit history.'),
  ('support_agent', 'Access to support tickets and document review operations.'),
  ('applicant', 'Access to the applicant’s own profile, documents and support tickets.');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.app_role not null default 'applicant',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  application_number text unique,
  date_of_birth date,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references public.users(id) on delete cascade,
  role_id smallint not null references public.roles(id),
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  document_type text not null,
  original_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  review_status public.review_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_reviews (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.uploaded_documents(id) on delete cascade,
  reviewer_id uuid not null references public.admin_users(user_id),
  status public.review_status not null,
  internal_notes text,
  applicant_message text,
  created_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subject text not null check (char_length(subject) between 4 and 160),
  status public.ticket_status not null default 'open',
  priority public.ticket_priority not null default 'normal',
  assigned_to uuid references public.admin_users(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_user_id uuid not null references public.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index users_role_idx on public.users(role);
create index uploaded_documents_user_id_idx on public.uploaded_documents(user_id);
create index uploaded_documents_review_status_idx on public.uploaded_documents(review_status);
create index document_reviews_document_id_idx on public.document_reviews(document_id);
create index support_tickets_user_id_idx on public.support_tickets(user_id);
create index support_tickets_status_idx on public.support_tickets(status);
create index support_messages_ticket_id_created_at_idx on public.support_messages(ticket_id, created_at);
create index audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index audit_logs_actor_user_id_idx on public.audit_logs(actor_user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on public.users
for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.user_profiles
for each row execute function public.set_updated_at();
create trigger admins_set_updated_at before update on public.admin_users
for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.uploaded_documents
for each row execute function public.set_updated_at();
create trigger tickets_set_updated_at before update on public.support_tickets
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, new.id::text || '@unknown.local'));

  insert into public.user_profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_staff(check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    join public.roles r on r.id = au.role_id
    where au.user_id = check_user_id
      and au.is_active
      and r.name in ('admin', 'support_agent')
  );
$$;

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    join public.roles r on r.id = au.role_id
    where au.user_id = check_user_id and au.is_active and r.name = 'admin'
  );
$$;

create or replace function public.create_support_ticket(
  ticket_subject text,
  first_message text,
  ticket_priority public.ticket_priority default 'normal'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_ticket_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(ticket_subject)) not between 4 and 160 then raise exception 'Subject must be between 4 and 160 characters'; end if;
  if char_length(trim(first_message)) not between 1 and 5000 then raise exception 'Message must be between 1 and 5000 characters'; end if;
  insert into public.support_tickets (user_id, subject, priority)
  values (auth.uid(), ticket_subject, ticket_priority)
  returning id into new_ticket_id;

  insert into public.support_messages (ticket_id, sender_user_id, body)
  values (new_ticket_id, auth.uid(), first_message);

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id)
  values (auth.uid(), 'support_ticket.created', 'support_ticket', new_ticket_id::text);
  return new_ticket_id;
end;
$$;

create or replace function public.reply_support_ticket(
  target_ticket_id uuid,
  message_body text,
  next_status public.ticket_status default null,
  internal_message boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_message_id uuid;
  ticket_owner uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(message_body)) not between 1 and 5000 then raise exception 'Message must be between 1 and 5000 characters'; end if;
  select user_id into ticket_owner from public.support_tickets where id = target_ticket_id;
  if ticket_owner is null or (ticket_owner <> auth.uid() and not public.is_staff()) then
    raise exception 'Ticket not found or access denied';
  end if;
  if internal_message and not public.is_staff() then raise exception 'Only staff can create internal notes'; end if;
  if next_status is not null and not public.is_staff() then raise exception 'Only staff can change ticket status'; end if;

  insert into public.support_messages (ticket_id, sender_user_id, body, is_internal)
  values (target_ticket_id, auth.uid(), message_body, internal_message)
  returning id into new_message_id;

  update public.support_tickets
  set status = coalesce(next_status, status),
      resolved_at = case when next_status = 'resolved' then now() when next_status is not null then null else resolved_at end
  where id = target_ticket_id;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'support_ticket.replied', 'support_ticket', target_ticket_id::text, jsonb_build_object('status', next_status, 'internal', internal_message));
  return new_message_id;
end;
$$;

create or replace function public.review_document(
  target_document_id uuid,
  decision public.review_status,
  notes text default '',
  message_to_applicant text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_review_id uuid;
begin
  if not public.is_staff() then raise exception 'Staff access required'; end if;
  if decision = 'pending' then raise exception 'A final review decision is required'; end if;

  update public.uploaded_documents set review_status = decision where id = target_document_id;
  if not found then raise exception 'Document not found'; end if;

  insert into public.document_reviews (document_id, reviewer_id, status, internal_notes, applicant_message)
  values (target_document_id, auth.uid(), decision, nullif(notes, ''), nullif(message_to_applicant, ''))
  returning id into new_review_id;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'document.reviewed', 'uploaded_document', target_document_id::text, jsonb_build_object('status', decision));
  return new_review_id;
end;
$$;

create or replace function public.register_uploaded_document(
  document_kind text,
  uploaded_name text,
  object_path text,
  content_type text,
  content_size bigint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_document_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(document_kind)) not between 2 and 100 then raise exception 'Invalid document type'; end if;
  if content_size <= 0 or content_size > 10485760 then raise exception 'Invalid file size'; end if;
  if content_type not in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp') then raise exception 'Unsupported content type'; end if;
  if split_part(object_path, '/', 1) <> auth.uid()::text then raise exception 'Invalid storage path'; end if;
  if not exists (
    select 1 from storage.objects
    where bucket_id = 'applicant-documents' and name = object_path and owner_id = auth.uid()::text
  ) then raise exception 'Uploaded storage object was not found'; end if;

  insert into public.uploaded_documents (user_id, document_type, original_name, storage_path, mime_type, size_bytes)
  values (auth.uid(), trim(document_kind), uploaded_name, object_path, content_type, content_size)
  returning id into new_document_id;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'document.uploaded', 'uploaded_document', new_document_id::text, jsonb_build_object('documentType', trim(document_kind)));
  return new_document_id;
end;
$$;

revoke all on function public.is_staff(uuid) from public;
revoke all on function public.is_admin(uuid) from public;
revoke all on function public.create_support_ticket(text, text, public.ticket_priority) from public;
revoke all on function public.reply_support_ticket(uuid, text, public.ticket_status, boolean) from public;
revoke all on function public.review_document(uuid, public.review_status, text, text) from public;
revoke all on function public.register_uploaded_document(text, text, text, text, bigint) from public;
grant execute on function public.is_staff(uuid), public.is_admin(uuid) to authenticated, service_role;
grant execute on function public.create_support_ticket(text, text, public.ticket_priority) to authenticated;
grant execute on function public.reply_support_ticket(uuid, text, public.ticket_status, boolean) to authenticated;
grant execute on function public.review_document(uuid, public.review_status, text, text) to authenticated;
grant execute on function public.register_uploaded_document(text, text, text, text, bigint) to authenticated;

alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.uploaded_documents enable row level security;
alter table public.document_reviews enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.audit_logs enable row level security;

revoke all on all tables in schema public from anon;
grant select on public.roles to authenticated;
grant select on public.users to authenticated;
grant select, update on public.user_profiles to authenticated;
grant select on public.admin_users to authenticated;
grant select on public.uploaded_documents, public.document_reviews, public.support_tickets, public.support_messages, public.audit_logs to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- The service-role key (server-side admin client) bypasses RLS but still
-- needs table grants. Without these, server operations fail with
-- "permission denied for table ...".
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

create policy "authenticated can read roles" on public.roles
for select to authenticated using (true);

create policy "users read self or staff read all" on public.users
for select to authenticated using ((select auth.uid()) = id or public.is_staff());
create policy "profiles read self or staff read all" on public.user_profiles
for select to authenticated using ((select auth.uid()) = user_id or public.is_staff());
create policy "profiles update self or staff update all" on public.user_profiles
for update to authenticated using ((select auth.uid()) = user_id or public.is_staff())
with check ((select auth.uid()) = user_id or public.is_staff());

create policy "staff records visible to owner or staff" on public.admin_users
for select to authenticated using ((select auth.uid()) = user_id or public.is_staff());

create policy "documents visible to owner or staff" on public.uploaded_documents
for select to authenticated using ((select auth.uid()) = user_id or public.is_staff());
create policy "staff read reviews" on public.document_reviews
for select to authenticated using (public.is_staff());

create policy "tickets visible to owner or staff" on public.support_tickets
for select to authenticated using ((select auth.uid()) = user_id or public.is_staff());
create policy "ticket messages visible to participants" on public.support_messages
for select to authenticated using (
  public.is_staff() or exists (
    select 1 from public.support_tickets t
    where t.id = ticket_id and t.user_id = (select auth.uid()) and not is_internal
  )
);
create policy "staff read audit logs" on public.audit_logs
for select to authenticated using (public.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'applicant-documents',
  'applicant-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "owners and staff read document files" on storage.objects;
create policy "owners and staff read document files" on storage.objects
for select to authenticated using (
  bucket_id = 'applicant-documents'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_staff())
);
drop policy if exists "applicants upload into own folder" on storage.objects;
create policy "applicants upload into own folder" on storage.objects
for insert to authenticated with check (
  bucket_id = 'applicant-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
drop policy if exists "owners update own document files" on storage.objects;
create policy "owners update own document files" on storage.objects
for update to authenticated using (
  bucket_id = 'applicant-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
) with check (
  bucket_id = 'applicant-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
drop policy if exists "owners delete own document files" on storage.objects;
create policy "owners delete own document files" on storage.objects
for delete to authenticated using (
  bucket_id = 'applicant-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create type public.application_status as enum ('draft', 'in_progress', 'ready_for_review', 'processing', 'completed');
create type public.requirement_status as enum ('not_started', 'processing', 'action_needed', 'completed');
create type public.update_category as enum ('important', 'deadline', 'general');
create type public.payment_status as enum ('not_due', 'due', 'paid');

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  status public.application_status not null default 'draft',
  payment_status public.payment_status not null default 'not_due',
  payment_amount numeric(12, 2),
  jamb_registration_number text,
  state_of_residence text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.requirements (
  id text primary key,
  title text not null,
  description text not null,
  guidance text,
  accepted_files text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_requirements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  requirement_id text not null references public.requirements(id) on delete cascade,
  status public.requirement_status not null default 'not_started',
  note text,
  document_id uuid references public.uploaded_documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, requirement_id)
);

create table public.universities (
  id text primary key,
  name text not null,
  short_name text not null,
  location text not null,
  description text not null,
  programmes text not null,
  application_deadline date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.university_selections (
  user_id uuid not null references public.users(id) on delete cascade,
  university_id text not null references public.universities(id) on delete cascade,
  selected_at timestamptz not null default now(),
  primary key (user_id, university_id)
);

create table public.university_updates (
  id uuid primary key default gen_random_uuid(),
  university_id text not null references public.universities(id) on delete cascade,
  title text not null,
  description text not null,
  category public.update_category not null default 'general',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  href text not null default '/dashboard',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notification_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  preferences jsonb not null default '{"application":{"sms":true,"email":true},"university":{"sms":false,"email":true},"deadline":{"sms":true,"email":true},"action":{"sms":true,"email":true},"completion":{"sms":false,"email":true}}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.system_notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_id_idx on public.applications(user_id);
create index user_requirements_user_id_idx on public.user_requirements(user_id);
create index university_selections_user_id_idx on public.university_selections(user_id);
create index university_updates_university_id_published_at_idx on public.university_updates(university_id, published_at desc);
create index notifications_user_id_created_at_idx on public.notifications(user_id, created_at desc);

create trigger applications_set_updated_at before update on public.applications for each row execute function public.set_updated_at();
create trigger requirements_set_updated_at before update on public.requirements for each row execute function public.set_updated_at();
create trigger user_requirements_set_updated_at before update on public.user_requirements for each row execute function public.set_updated_at();
create trigger universities_set_updated_at before update on public.universities for each row execute function public.set_updated_at();
create trigger notification_preferences_set_updated_at before update on public.notification_preferences for each row execute function public.set_updated_at();
create trigger system_notices_set_updated_at before update on public.system_notices for each row execute function public.set_updated_at();

create or replace function public.handle_new_application_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role = 'applicant' then
    insert into public.applications (user_id) values (new.id) on conflict (user_id) do nothing;
    insert into public.notification_preferences (user_id) values (new.id) on conflict (user_id) do nothing;
    insert into public.user_requirements (user_id, requirement_id)
    select new.id, id from public.requirements where is_active
    on conflict (user_id, requirement_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_public_applicant_created
after insert on public.users
for each row execute function public.handle_new_application_user();

insert into public.applications (user_id)
select id from public.users where role = 'applicant'
on conflict (user_id) do nothing;
insert into public.notification_preferences (user_id)
select id from public.users where role = 'applicant'
on conflict (user_id) do nothing;

alter table public.applications enable row level security;
alter table public.requirements enable row level security;
alter table public.user_requirements enable row level security;
alter table public.universities enable row level security;
alter table public.university_selections enable row level security;
alter table public.university_updates enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.system_notices enable row level security;

grant select on public.applications, public.requirements, public.user_requirements, public.universities, public.university_selections, public.university_updates, public.notifications, public.notification_preferences, public.system_notices to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant update on public.notification_preferences to authenticated;
grant insert on public.notification_preferences to authenticated;
grant update (jamb_registration_number, state_of_residence) on public.applications to authenticated;
revoke update on public.user_profiles from authenticated;
grant update (full_name, phone, date_of_birth, avatar_path) on public.user_profiles to authenticated;

create policy "applications visible to owner or staff" on public.applications for select to authenticated using (user_id = (select auth.uid()) or public.is_staff());
create policy "applicants update own application details" on public.applications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "requirements visible to authenticated users" on public.requirements for select to authenticated using (is_active or public.is_staff());
create policy "user requirements visible to owner or staff" on public.user_requirements for select to authenticated using (user_id = (select auth.uid()) or public.is_staff());
create policy "universities visible to authenticated users" on public.universities for select to authenticated using (is_active or public.is_staff());
create policy "selections visible to owner or staff" on public.university_selections for select to authenticated using (user_id = (select auth.uid()) or public.is_staff());
create policy "university updates visible to authenticated users" on public.university_updates for select to authenticated using (true);
create policy "notifications visible to owner or staff" on public.notifications for select to authenticated using (user_id = (select auth.uid()) or public.is_staff());
create policy "owners mark notifications read" on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "preferences visible to owner" on public.notification_preferences for select to authenticated using (user_id = (select auth.uid()));
create policy "owners create preferences" on public.notification_preferences for insert to authenticated with check (user_id = (select auth.uid()));
create policy "owners update preferences" on public.notification_preferences for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "active system notices visible to authenticated users" on public.system_notices for select to authenticated using (is_active or public.is_staff());

create or replace function public.toggle_university_selection(target_university_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare selected_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if exists (select 1 from public.university_selections where user_id = auth.uid() and university_id = target_university_id) then
    delete from public.university_selections where user_id = auth.uid() and university_id = target_university_id;
    return false;
  end if;
  select count(*) into selected_count from public.university_selections where user_id = auth.uid();
  if selected_count >= 3 then raise exception 'You can select up to three universities'; end if;
  insert into public.university_selections (user_id, university_id) values (auth.uid(), target_university_id);
  return true;
end;
$$;

revoke all on function public.toggle_university_selection(text) from public;
grant execute on function public.toggle_university_selection(text) to authenticated;

-- Replace the original generic checklist with the Phase 1 UNIUYO screening checklist.
-- Requirement copy belongs in the database so the applicant UI never embeds a mock checklist.
update public.requirements
set is_active = false
where id in ('personal-details', 'waec-result', 'jamb-profile', 'passport-photograph', 'university-selection');

insert into public.requirements (id, title, description, guidance, accepted_files, display_order, is_active)
values
  ('utme-result-slip', 'JAMB Registration Number & UTME Result Slip', 'Upload your JAMB registration number and UTME result slip.', 'Use a clear copy that shows your registration number, name and UTME result.', 'PDF, PNG or JPEG up to 10 MB', 1, true),
  ('olevel-results', 'O’Level Result(s)', 'Submit WAEC, NECO or NABTEB result(s). A maximum of two sittings is accepted, with five credits including English and Mathematics.', 'Upload every result used for your screening application. Make all subjects and grades readable.', 'PDF, PNG or JPEG up to 10 MB', 2, true),
  ('jamb-caps-olevel-upload', 'JAMB CAPS O’Level Upload', 'Provide evidence that your O’Level result has been uploaded directly to your JAMB CAPS profile.', 'Upload a clear JAMB CAPS screenshot or confirmation slip showing the O’Level upload.', 'PDF, PNG or JPEG up to 10 MB', 3, true),
  ('passport-red-background', 'Recent Passport Photograph', 'Submit a clear recent passport photograph on a red background.', 'Your face must be clearly visible, centred and unobstructed.', 'PNG or JPEG up to 10 MB', 4, true),
  ('active-contact-details', 'Active Email Address & Phone Number', 'Confirm the active email address and phone number used for your application.', 'Upload a clear confirmation document or screenshot containing the contact details you will use for screening updates.', 'PDF, PNG or JPEG up to 10 MB', 5, true),
  ('uniuyo-screening-slip', 'UNIUYO Screening Exercise Slip', 'Pay the ₦2,000 screening fee through Remita, then upload your completed UNIUYO Screening Exercise Slip.', 'Upload the completed screening exercise slip after payment. Keep your Remita payment record for your reference.', 'PDF, PNG or JPEG up to 10 MB', 6, true)
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    guidance = excluded.guidance,
    accepted_files = excluded.accepted_files,
    display_order = excluded.display_order,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.user_requirements (user_id, requirement_id)
select u.id, r.id
from public.users u
cross join public.requirements r
where u.role = 'applicant' and r.is_active
on conflict (user_id, requirement_id) do nothing;

-- Navigation queries: keep per-user lists and review queues index-backed as data grows.
create index if not exists uploaded_documents_user_submitted_at_idx on public.uploaded_documents(user_id, submitted_at desc);
create index if not exists support_tickets_user_updated_at_idx on public.support_tickets(user_id, updated_at desc);
create index if not exists support_tickets_assignee_updated_at_idx on public.support_tickets(assigned_to, updated_at desc);
create index if not exists notifications_user_unread_created_at_idx on public.notifications(user_id, created_at desc) where read_at is null;

-- Admin-managed application requirements.
alter table public.requirements add column if not exists submission_type text not null default 'file' check (submission_type in ('file', 'text', 'both'));
alter table public.user_requirements add column if not exists response_text text;

create or replace function public.create_requirement(requirement_title text, requirement_subtitle text, requirement_guidance text, requirement_submission_type text)
returns text language plpgsql security definer set search_path = '' as $$
declare new_requirement_id text;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if char_length(trim(requirement_title)) not between 2 and 140 or char_length(trim(requirement_subtitle)) not between 2 and 500 then raise exception 'Title or subtitle is invalid'; end if;
  if requirement_submission_type not in ('file', 'text', 'both') then raise exception 'Submission type is invalid'; end if;
  new_requirement_id := concat('req-', floor(extract(epoch from clock_timestamp()) * 1000)::bigint, '-', floor(random() * 1000000)::bigint);
  insert into public.requirements (id, title, description, guidance, submission_type, display_order)
  values (new_requirement_id, trim(requirement_title), trim(requirement_subtitle), nullif(trim(requirement_guidance), ''), requirement_submission_type, coalesce((select max(display_order) + 1 from public.requirements), 0));
  insert into public.user_requirements (user_id, requirement_id)
  select id, new_requirement_id from public.users where role = 'applicant' on conflict (user_id, requirement_id) do nothing;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id) values (auth.uid(), 'requirement.created', 'requirement', new_requirement_id);
  return new_requirement_id;
end;
$$;

create or replace function public.update_requirement(requirement_id text, requirement_title text, requirement_subtitle text, requirement_guidance text, requirement_submission_type text)
returns text language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if char_length(trim(requirement_title)) not between 2 and 140 or char_length(trim(requirement_subtitle)) not between 2 and 500 then raise exception 'Title or subtitle is invalid'; end if;
  if requirement_submission_type not in ('file', 'text', 'both') then raise exception 'Submission type is invalid'; end if;
  update public.requirements set title = trim(requirement_title), description = trim(requirement_subtitle), guidance = nullif(trim(requirement_guidance), ''), submission_type = requirement_submission_type where id = requirement_id;
  if not found then raise exception 'Requirement not found'; end if;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id) values (auth.uid(), 'requirement.updated', 'requirement', requirement_id);
  return requirement_id;
end;
$$;

create or replace function public.delete_requirement(requirement_id text)
returns text language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  delete from public.requirements where id = requirement_id;
  if not found then raise exception 'Requirement not found'; end if;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id) values (auth.uid(), 'requirement.deleted', 'requirement', requirement_id);
  return requirement_id;
end;
$$;

revoke all on function public.create_requirement(text, text, text, text), public.update_requirement(text, text, text, text, text), public.delete_requirement(text) from public;
grant execute on function public.create_requirement(text, text, text, text), public.update_requirement(text, text, text, text, text), public.delete_requirement(text) to authenticated;

create or replace function public.submit_requirement_text(target_requirement_id text, submitted_text text)
returns text language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.requirements where id = target_requirement_id and is_active and submission_type in ('text', 'both')) then raise exception 'This requirement does not accept a text response'; end if;
  if char_length(trim(submitted_text)) not between 1 and 5000 then raise exception 'Response must be between 1 and 5000 characters'; end if;
  update public.user_requirements set response_text = trim(submitted_text), status = 'processing' where user_id = auth.uid() and requirement_id = target_requirement_id;
  if not found then raise exception 'Requirement not found for this applicant'; end if;
  return target_requirement_id;
end;
$$;
revoke all on function public.submit_requirement_text(text, text) from public;
grant execute on function public.submit_requirement_text(text, text) to authenticated;

-- Keep the staff-access record aligned with the canonical public.users role.
create or replace function public.sync_staff_workspace_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_role_id smallint;
  preferred_name text;
begin
  if new.role in ('admin', 'support_agent') then
    select id into target_role_id from public.roles where name = new.role;
    select coalesce(nullif(full_name, ''), new.email) into preferred_name
    from public.user_profiles
    where user_id = new.id;

    insert into public.admin_users (user_id, role_id, display_name, is_active)
    values (new.id, target_role_id, coalesce(preferred_name, new.email), true)
    on conflict (user_id) do update
    set role_id = excluded.role_id,
        display_name = excluded.display_name,
        is_active = true;
  else
    update public.admin_users set is_active = false where user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists users_sync_staff_workspace_role on public.users;
create trigger users_sync_staff_workspace_role
after insert or update of role on public.users
for each row execute function public.sync_staff_workspace_role();

insert into public.admin_users (user_id, role_id, display_name, is_active)
select u.id, r.id, coalesce(nullif(p.full_name, ''), u.email), true
from public.users u
join public.roles r on r.name = u.role
left join public.user_profiles p on p.user_id = u.id
where u.role in ('admin', 'support_agent')
on conflict (user_id) do update
set role_id = excluded.role_id,
    display_name = excluded.display_name,
    is_active = true;

update public.admin_users au
set is_active = false
from public.users u
where au.user_id = u.id
  and u.role = 'applicant';

-- Admins can publish general updates or target applicants who selected a university.
alter table public.university_updates alter column university_id drop not null;

drop policy if exists "university updates visible to authenticated users" on public.university_updates;
drop policy if exists "updates visible to staff or selected applicants" on public.university_updates;
create policy "updates visible to staff or selected applicants" on public.university_updates
for select to authenticated using (
  public.is_staff()
  or university_id is null
  or exists (
    select 1 from public.university_selections selection
    where selection.user_id = (select auth.uid())
      and selection.university_id = public.university_updates.university_id
  )
);

create or replace function public.create_university_update(
  update_title text,
  update_description text,
  update_category public.update_category default 'general',
  target_university_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_update_id uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if char_length(trim(update_title)) not between 4 and 160 then raise exception 'Title must be between 4 and 160 characters'; end if;
  if char_length(trim(update_description)) not between 1 and 2000 then raise exception 'Message must be between 1 and 2000 characters'; end if;
  if target_university_id is not null and not exists (select 1 from public.universities where id = target_university_id and is_active) then
    raise exception 'University not found';
  end if;

  insert into public.university_updates (university_id, title, description, category)
  values (target_university_id, trim(update_title), trim(update_description), update_category)
  returning id into new_update_id;

  insert into public.notifications (user_id, type, title, body, href)
  select u.id, 'update', trim(update_title), trim(update_description), '/dashboard/updates'
  from public.users u
  where u.role = 'applicant'
    and (
      target_university_id is null
      or exists (
        select 1 from public.university_selections selection
        where selection.user_id = u.id and selection.university_id = target_university_id
      )
    );

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'university_update.published', 'university_update', new_update_id::text, jsonb_build_object('university_id', target_university_id));
  return new_update_id;
end;
$$;

revoke all on function public.create_university_update(text, text, public.update_category, text) from public;
grant execute on function public.create_university_update(text, text, public.update_category, text) to authenticated;

-- Persistent staff-only group conversation. Messages can be edited but never deleted through the app.
create table if not exists public.staff_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.admin_users(user_id),
  body text not null check (char_length(body) between 1 and 5000),
  reply_to_id uuid references public.staff_messages(id) on delete restrict,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists public.staff_message_versions (
  id bigint generated always as identity primary key,
  message_id uuid not null references public.staff_messages(id) on delete restrict,
  body text not null,
  version integer not null check (version > 0),
  created_at timestamptz not null default now(),
  unique (message_id, version)
);

create index if not exists staff_messages_created_at_idx on public.staff_messages(created_at);
create index if not exists staff_messages_reply_to_id_idx on public.staff_messages(reply_to_id);
create index if not exists staff_message_versions_message_id_idx on public.staff_message_versions(message_id, version desc);

alter table public.staff_messages enable row level security;
alter table public.staff_message_versions enable row level security;
grant select on public.staff_messages, public.staff_message_versions to authenticated;
grant usage, select on sequence public.staff_message_versions_id_seq to authenticated;

drop policy if exists "staff can read group messages" on public.staff_messages;
drop policy if exists "staff can read message versions" on public.staff_message_versions;
create policy "staff can read group messages" on public.staff_messages for select to authenticated using (public.is_staff());
create policy "staff can read message versions" on public.staff_message_versions for select to authenticated using (public.is_staff());

create or replace function public.send_staff_message(
  message_body text,
  reply_to_message_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare new_message_id uuid;
begin
  if not public.is_staff() then raise exception 'Staff access required'; end if;
  if char_length(trim(message_body)) not between 1 and 5000 then raise exception 'Message must be between 1 and 5000 characters'; end if;
  if reply_to_message_id is not null and not exists (select 1 from public.staff_messages where id = reply_to_message_id) then raise exception 'Reply target not found'; end if;
  insert into public.staff_messages (sender_id, body, reply_to_id)
  values (auth.uid(), trim(message_body), reply_to_message_id)
  returning id into new_message_id;
  return new_message_id;
end;
$$;

create or replace function public.edit_staff_message(
  target_message_id uuid,
  replacement_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare current_body text; next_version integer;
begin
  if not public.is_staff() then raise exception 'Staff access required'; end if;
  if char_length(trim(replacement_body)) not between 1 and 5000 then raise exception 'Message must be between 1 and 5000 characters'; end if;
  select body into current_body from public.staff_messages where id = target_message_id and sender_id = auth.uid();
  if current_body is null then raise exception 'Only the sender can edit this message'; end if;
  if current_body = trim(replacement_body) then return target_message_id; end if;
  select coalesce(max(version), 0) + 1 into next_version from public.staff_message_versions where message_id = target_message_id;
  insert into public.staff_message_versions (message_id, body, version) values (target_message_id, current_body, next_version);
  update public.staff_messages set body = trim(replacement_body), edited_at = now() where id = target_message_id;
  return target_message_id;
end;
$$;

revoke all on function public.send_staff_message(text, uuid), public.edit_staff_message(uuid, text) from public;
grant execute on function public.send_staff_message(text, uuid), public.edit_staff_message(uuid, text) to authenticated;

-- Public application records are created only after Supabase Auth confirms the email.
-- Before confirmation, the signup exists solely in auth.users.
drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.create_confirmed_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  insert into public.users (id, email)
  values (new.id, coalesce(new.email, new.id::text || '@unknown.local'))
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  insert into public.user_profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
after insert or update of email_confirmed_at on auth.users
for each row execute function public.create_confirmed_auth_user();

-- Remove records that the former signup trigger created for accounts that are
-- still unverified. Deleting public.users cascades their dependent app records.
delete from public.users
where id in (
  select id
  from auth.users
  where email_confirmed_at is null
);

-- Ensure accounts confirmed before the email-confirmation trigger was installed
-- can sign in and receive their public application records.
insert into public.users (id, email)
select id, coalesce(email, id::text || '@unknown.local')
from auth.users
where email_confirmed_at is not null
on conflict (id) do update
set email = excluded.email,
    updated_at = now();

insert into public.user_profiles (user_id, full_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
where email_confirmed_at is not null
on conflict (user_id) do nothing;

insert into public.applications (user_id)
select id
from public.users
where role = 'applicant'
on conflict (user_id) do nothing;

insert into public.notification_preferences (user_id)
select id
from public.users
where role = 'applicant'
on conflict (user_id) do nothing;

insert into public.user_requirements (user_id, requirement_id)
select u.id, r.id
from public.users u
cross join public.requirements r
where u.role = 'applicant' and r.is_active
on conflict (user_id, requirement_id) do nothing;
