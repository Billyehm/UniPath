import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { generateRRR, koboToNaira, formatNaira } from '@/lib/remita'
import type { Json } from '@/lib/database.types'

/**
 * Generate (or reuse) a Remita RRR for a payment-type requirement.
 * Body: { requirementId: string }
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

  // Reuse an existing pending RRR instead of generating duplicates.
  const { data: existing } = await supabase
    .from('payments')
    .select('id,rrr,amount_kobo,status')
    .eq('user_id', user.id)
    .eq('requirement_id', requirementId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ paymentId: existing.id, rrr: existing.rrr, amountKobo: existing.amount_kobo, reused: true })
  }

  const { data: profile } = await supabase.from('user_profiles').select('full_name,phone').eq('user_id', user.id).maybeSingle()

  const orderId = `UNIPATH-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
  let rrr: string
  let raw: unknown
  try {
    const result = await generateRRR({
      orderId,
      amountNaira: koboToNaira(requirement.amount_kobo),
      payerName: profile?.full_name || user.email,
      payerEmail: user.email,
      payerPhone: profile?.phone || '',
      description: `UniPath: ${requirement.title}`,
    })
    rrr = result.rrr
    raw = result.raw
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Remita request failed.' }, { status: 502 })
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      requirement_id: requirementId,
      rrr,
      order_id: orderId,
      amount_kobo: requirement.amount_kobo,
      status: 'pending',
      payer_name: profile?.full_name || user.email,
      payer_email: user.email,
      payer_phone: profile?.phone || null,
      remita_response: raw as Json,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: 'Could not save the payment reference.' }, { status: 500 })
  return NextResponse.json({ paymentId: payment.id, rrr, amountKobo: requirement.amount_kobo, amountLabel: formatNaira(requirement.amount_kobo) })
}
