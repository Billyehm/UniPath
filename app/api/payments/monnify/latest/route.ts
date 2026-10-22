import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'

/** Latest payment attempt for a requirement (or overall when omitted). */
export async function GET(request: Request) {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const requirementId = new URL(request.url).searchParams.get('requirementId')
  let query = supabase
    .from('payments')
    .select('id,reference,checkout_url,amount_kobo,status,verified_at,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
  if (requirementId) query = query.eq('requirement_id', requirementId)

  const { data } = await query.maybeSingle()
  return NextResponse.json({ payment: data ?? null })
}
