import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'

const TYPES = new Set(['university', 'polytechnic', 'college_of_education'])

function params(url: string) {
  const search = new URL(url).searchParams
  const limit = Math.min(Math.max(Number(search.get('limit')) || 48, 1), 100)
  const offset = Math.max(Number(search.get('offset')) || 0, 0)
  return { q: (search.get('q') || '').trim().slice(0, 80), type: search.get('type') || '', state: (search.get('state') || '').trim().slice(0, 40), limit, offset }
}

export async function GET(request: Request) {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { q, type, state, limit, offset } = params(request.url)
  let query = supabase.from('institutions').select('id,name,type,ownership,state,year_established,website', { count: 'exact' }).order('name')
  if (q) query = query.or(`name.ilike.%${q}%,state.ilike.%${q}%`)
  if (type && TYPES.has(type)) query = query.eq('type', type)
  if (state) query = query.ilike('state', `%${state}%`)

  const { data, error, count } = await query.range(offset, offset + limit - 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ institutions: data, total: count ?? data.length })
}
