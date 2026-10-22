import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { checkRRRStatus } from '@/lib/remita'
import type { Json } from '@/lib/database.types'

/**
 * Verify a Remita payment against the gateway. On success the linked
 * requirement is marked completed and the application payment flips to paid.
 * Body: { paymentId: string }
 */
export async function POST(request: Request) {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { paymentId } = (await request.json().catch(() => ({}))) as { paymentId?: string }
  if (!paymentId || typeof paymentId !== 'string') {
    return NextResponse.json({ error: 'A payment is required.' }, { status: 400 })
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('id,rrr,requirement_id,status')
    .eq('id', paymentId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!payment) return NextResponse.json({ error: 'Payment not found.' }, { status: 404 })
  if (payment.status === 'successful') return NextResponse.json({ status: 'successful' })

  let result: { status: 'successful' | 'pending' | 'failed'; raw: unknown }
  try {
    result = await checkRRRStatus(payment.rrr)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Status check failed.' }, { status: 502 })
  }

  await supabase
    .from('payments')
    .update({
      status: result.status,
      remita_response: result.raw as Json,
      verified_at: result.status === 'successful' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id)

  if (result.status === 'successful' && payment.requirement_id) {
    await supabase
      .from('user_requirements')
      .update({ status: 'completed' as const, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('requirement_id', payment.requirement_id)
    await supabase.from('applications').update({ payment_status: 'paid' as const }).eq('user_id', user.id)
  }

  return NextResponse.json({ status: result.status })
}
