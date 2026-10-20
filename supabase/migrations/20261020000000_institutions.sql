-- Institutions directory: all Nigerian tertiary institutions + their courses.
-- Reference data seeded from supabase/seed/institutions_seed.sql.

create table public.institutions (
  id text primary key,
  name text not null,
  type text not null check (type in ('university', 'polytechnic', 'college_of_education')),
  ownership text not null check (ownership in ('federal', 'state', 'private')),
  state text not null,
  year_established integer,
  website text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.institution_courses (
  id uuid primary key default gen_random_uuid(),
  institution_id text not null references public.institutions(id) on delete cascade,
  course_name text not null,
  qualification text not null,
  duration_years integer,
  faculty text,
  source text not null default 'inferred' check (source in ('listed', 'inferred')),
  created_at timestamptz not null default now(),
  unique (institution_id, course_name, qualification)
);

create index institutions_type_idx on public.institutions(type);
create index institutions_state_idx on public.institutions(state);
create index institution_courses_institution_id_idx on public.institution_courses(institution_id);

create trigger institutions_set_updated_at before update on public.institutions
for each row execute function public.set_updated_at();

alter table public.institutions enable row level security;
alter table public.institution_courses enable row level security;

grant select on public.institutions, public.institution_courses to authenticated;

create policy "institutions visible to authenticated users" on public.institutions
for select to authenticated using (is_active or public.is_staff());

create policy "institution courses visible to authenticated users" on public.institution_courses
for select to authenticated using (
  exists (
    select 1 from public.institutions i
    where i.id = institution_courses.institution_id
      and (i.is_active or public.is_staff())
  )
);
