# Supabase backend setup

## Configure a project

1. Create a Supabase project or start the local stack with the Supabase CLI.
2. Copy `.env.example` to `.env.local` and fill in the project URL, publishable key, and server-only service role key.
3. For a new project, apply [`supabase/migrations/20260925000000_initial_schema.sql`](supabase/migrations/20260925000000_initial_schema.sql) once. Use `supabase db push`, or paste its contents into the hosted SQL editor. If you already created the database before the role-sync fix, also apply [`supabase/migrations/20260925010000_role_workspace_sync.sql`](supabase/migrations/20260925010000_role_workspace_sync.sql).
4. In Supabase Auth, enable **Confirm email**, then add `http://localhost:3000/auth/callback` and the production equivalent to the redirect allow list exactly.
5. Run `pnpm seed` to create 3 staff users, 10 applicants, 20 tickets, 15 stored documents, application requirements, universities, notifications, message history, and audit activity.

The seed password is `UniPathSeed!2026`. Seed accounts use the `@unipath.test` domain; the primary admin is `admin@unipath.test`. Change or remove seed credentials before production use.

## Security model

- Supabase Auth owns credentials and sessions. Next.js 16 `proxy.ts` refreshes cookies and protects `/dashboard`, `/admin`, and `/operations`. A signup stays only in `auth.users` until its email is confirmed; confirmation then creates the public user, profile, application, and requirement records.
- `/admin` accepts active `admin` and `support_agent` records. Audit logs require the `admin` role.
- PostgreSQL RLS is enabled for every public application table. Applicant records are owner-scoped; staff access is checked with security-definer helper functions.
- Dashboard requirements, university choices, updates, notifications, payment state, and profile fields are read from Supabase rather than bundled application data.
- `applicant-documents` is private. Applicants can access only their own UUID-prefixed folder; staff can create short-lived signed preview URLs.
- `SUPABASE_SERVICE_ROLE_KEY` is used only by the seed script and must never be exposed with a `NEXT_PUBLIC_` prefix.

## Verification

```bash
pnpm typecheck
pnpm build
pnpm dev
```

Sign in through `/auth`, then use `/admin`, `/admin/support`, and `/admin/documents` for staff workflows. Applicants upload files at `/dashboard/documents` and create ticket threads at `/dashboard/messages`.

## Promote an existing account

The sidebar is selected from the user’s database role, not from a hardcoded email. Run this in the Supabase SQL editor after replacing the email and role:

```sql
update public.users
set role = 'admin'
where email = 'your-email@example.com';

insert into public.admin_users (user_id, role_id, display_name)
select u.id, r.id, coalesce(nullif(p.full_name, ''), u.email)
from public.users u
join public.roles r on r.name = 'admin'
left join public.user_profiles p on p.user_id = u.id
where u.email = 'your-email@example.com'
on conflict (user_id) do update
set role_id = excluded.role_id,
    display_name = excluded.display_name,
    is_active = true;
```

Use `support_agent` in both statements to give the account the support-agent workspace. Sign out and back in after changing a role.
