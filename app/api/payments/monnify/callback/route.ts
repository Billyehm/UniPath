import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { queryTransaction } from '@/lib/monnify'
import type { Json } from '@/lib/database.types'

/**
 * Monnify redirects the student here after payment.
 * Verifies the transaction, completes the requirement on success,
 * then sends the student back to the requirement page.
 */
export async function GET(request: Request) {
  const supabase = createAdminClient()
  const params = new URL(request.url).searchParams
  const paymentReference = params.get('paymentReference') || ''

  const { data: payment } = await supabase
    .from('payments')
    .select('id,user_id,requirement_id,status')
    .eq('reference', paymentReference)
    .maybeSingle()

  const fallback = new URL('/dashboard/payment', request.url)
  if (!payment) return NextResponse.redirect(fallback)

  const back = new URL(
    payment.requirement_id ? `/dashboard/requirements/${payment.requirement_id}` : '/dashboard/payment',
    request.url,
  )

  if (payment.status === 'successful') {
    back.searchParams.set('paid', '1')
    return NextResponse.redirect(back)
  }

  try {
    const result = await queryTransaction(paymentReference)
    const status = result.status === 'PAID' ? 'successful' : result.status === 'FAILED' ? 'failed' : 'pending'
    await supabase
      .from('payments')
      .update({
        status,
        provider_reference: params.get('transactionReference') || undefined,
        provider_response: result.raw as Json,
        verified_at: status === 'successful' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    if (status === 'successful' && payment.requirement_id) {
      await supabase
        .from('user_requirements')
        .update({ status: 'completed' as const, updated_at: new Date().toISOString() })
        .eq('user_id', payment.user_id)
        .eq('requirement_id', payment.requirement_id)
      await supabase.from('applications').update({ payment_status: 'paid' as const }).eq('user_id', payment.user_id)
      back.searchParams.set('paid', '1')
    } else {
      back.searchParams.set('payment', status)
    }
  } catch {
    back.searchParams.set('payment', 'error')
  }

  return NextResponse.redirect(back)
}
