import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { queryTransaction } from '@/lib/monnify'
import type { Json } from '@/lib/database.types'

/**
 * Manually re-check a payment with Monnify. On success the linked
 * requirement is marked completed and the application flips to paid.
 * Body: { reference: string }
 */
export async function POST(request: Request) {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { reference } = (await request.json().catch(() => ({}))) as { reference?: string }
  if (!reference || typeof reference !== 'string') {
    return NextResponse.json({ error: 'A payment reference is required.' }, { status: 400 })
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('id,reference,requirement_id,status')
    .eq('reference', reference)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!payment) return NextResponse.json({ error: 'Payment not found.' }, { status: 404 })
  if (payment.status === 'successful') return NextResponse.json({ status: 'successful' })

  let result: Awaited<ReturnType<typeof queryTransaction>>
  try {
    result = await queryTransaction(payment.reference)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Status check failed.' }, { status: 502 })
  }

  const status = result.status === 'PAID' ? 'successful' : result.status === 'FAILED' ? 'failed' : 'pending'
  await supabase
    .from('payments')
    .update({
      status,
      provider_response: result.raw as Json,
      verified_at: status === 'successful' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id)

  if (status === 'successful' && payment.requirement_id) {
    // Privileged updates run as service role: the payment was already
    // verified to belong to this user above, and both writes stay scoped
    // to their own user_id.
    const admin = createAdminClient()
    await admin
      .from('user_requirements')
      .update({ status: 'completed' as const, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('requirement_id', payment.requirement_id)
    await admin.from('applications').update({ payment_status: 'paid' as const }).eq('user_id', user.id)
  }

  return NextResponse.json({ status })
}
