import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { initTransaction, koboToNaira, formatNaira } from '@/lib/monnify'
import type { Json } from '@/lib/database.types'

/**
 * Start a Monnify payment for a payment-type requirement.
 * Body: { requirementId: string }
 * Returns a Monnify checkout URL the student is redirected to.
 */
export async function POST(request: Request) {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { requirementId } = (await request.json().catch(() => ({}))) as { requirementId?: string }
  if (!requirementId || typeof requirementId !== 'string') {
    return NextResponse.json({ error: 'A requirement is required.' }, { status: 400 })
  }

  const { data: requirement } = await supabase
    .from('requirements')
    .select('id,title,submission_type,amount_kobo,is_active')
    .eq('id', requirementId)
    .maybeSingle()

  if (!requirement || !requirement.is_active) return NextResponse.json({ error: 'Requirement not found.' }, { status: 404 })
  if (requirement.submission_type !== 'payment' || !requirement.amount_kobo) {
    return NextResponse.json({ error: 'This requirement is not a payment step.' }, { status: 400 })
  }

  // Reuse an existing pending payment instead of starting duplicates.
  const { data: existing } = await supabase
    .from('payments')
    .select('id,reference,checkout_url,amount_kobo,status')
    .eq('user_id', user.id)
    .eq('requirement_id', requirementId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({
      paymentId: existing.id,
      reference: existing.reference,
      checkoutUrl: existing.checkout_url,
      amountKobo: existing.amount_kobo,
      reused: true,
    })
  }

  const { data: profile } = await supabase.from('user_profiles').select('full_name,phone').eq('user_id', user.id).maybeSingle()

  const paymentReference = `UNIPATH-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
  const redirectUrl = `${new URL(request.url).origin}/api/payments/monnify/callback`

  let result: Awaited<ReturnType<typeof initTransaction>>
  try {
    result = await initTransaction({
      amountNaira: koboToNaira(requirement.amount_kobo),
      paymentReference,
      customerName: profile?.full_name || user.email,
      customerEmail: user.email,
      paymentDescription: `UniPath: ${requirement.title}`,
      redirectUrl,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Monnify request failed.' }, { status: 502 })
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      requirement_id: requirementId,
      reference: result.paymentReference,
      provider_reference: result.transactionReference,
      checkout_url: result.checkoutUrl,
      amount_kobo: requirement.amount_kobo,
      status: 'pending',
      payer_name: profile?.full_name || user.email,
      payer_email: user.email,
      payer_phone: profile?.phone || null,
      provider_response: result.raw as Json,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: 'Could not save the payment.' }, { status: 500 })
  return NextResponse.json({
    paymentId: payment.id,
    reference: result.paymentReference,
    checkoutUrl: result.checkoutUrl,
    amountKobo: requirement.amount_kobo,
    amountLabel: formatNaira(requirement.amount_kobo),
    testMode: result.testMode,
  })
}
