import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { id } = await params
  if (!/^[a-z0-9-]{1,80}$/.test(id)) return NextResponse.json({ error: 'Invalid institution' }, { status: 400 })

  const search = new URL(request.url).searchParams
  const q = (search.get('q') || '').trim().slice(0, 80)
  const limit = Math.min(Math.max(Number(search.get('limit')) || 100, 1), 200)
  const offset = Math.max(Number(search.get('offset')) || 0, 0)

  let query = supabase
    .from('institution_courses')
    .select('id,course_name,qualification,duration_years,faculty,source', { count: 'exact' })
    .eq('institution_id', id)
    .order('course_name')
  if (q) query = query.ilike('course_name', `%${q}%`)

  const { data, error, count } = await query.range(offset, offset + limit - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ courses: data, total: count ?? data.length })
}
