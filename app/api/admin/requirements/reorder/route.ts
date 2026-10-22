import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

/** Persist a new checklist order. Body: { ids: string[] } in top-to-bottom order. */
export async function PATCH(request: Request) {
  const { user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const { ids } = (await request.json().catch(() => ({}))) as { ids?: unknown }
  if (!Array.isArray(ids) || !ids.length || !ids.every((id) => typeof id === 'string')) {
    return NextResponse.json({ error: 'A list of requirement ids is required.' }, { status: 400 })
  }
  const admin = createAdminClient()
  for (let index = 0; index < ids.length; index++) {
    const { error } = await admin.from('requirements').update({ display_order: index }).eq('id', ids[index])
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
