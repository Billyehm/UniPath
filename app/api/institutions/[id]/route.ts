import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { id } = await params
  if (!/^[a-z0-9-]{1,80}$/.test(id)) return NextResponse.json({ error: 'Invalid institution' }, { status: 400 })

  const { data, error } = await supabase
    .from('institutions')
    .select('id,name,type,ownership,state,year_established,website')
    .eq('id', id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ error: 'Institution not found' }, { status: 404 })

  const { count } = await supabase.from('institution_courses').select('id', { count: 'exact', head: true }).eq('institution_id', id)
  return NextResponse.json({ institution: data, courseCount: count ?? 0 })
}
