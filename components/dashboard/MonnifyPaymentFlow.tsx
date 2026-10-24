'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BadgeCheck, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { formatNaira } from '@/lib/monnify'
import Toast from '@/components/Toast'

type Payment = {
  id: string
  reference: string
  checkout_url: string | null
  amount_kobo: number
  status: 'pending' | 'successful' | 'failed'
  verified_at: string | null
}

export default function MonnifyPaymentFlow({ requirementId, amountKobo }: { requirementId: string; amountKobo: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [testMode, setTestMode] = useState(false)
  const [returnState, setReturnState] = useState<string | null>(null)

  useEffect(() => {
    setReturnState(searchParams.get('paid') ? 'paid' : searchParams.get('payment'))
    fetch(`/api/payments/monnify/latest?requirementId=${requirementId}`)
      .then((res) => res.json())
      .then((data) => setPayment(data.payment ?? null))
      .catch(() => setPayment(null))
      .finally(() => setLoading(false))
  }, [requirementId, searchParams])

  async function initiate() {
    setBusy(true); setError('')
    const response = await fetch('/api/payments/monnify/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirementId }),
    })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Could not start the payment.'); setBusy(false); return }
    setBusy(false)
    if (result.testMode) {
      setTestMode(true)
      setPayment({ id: result.paymentId, reference: result.reference, checkout_url: null, amount_kobo: result.amountKobo, status: 'pending', verified_at: null })
    } else if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl
    } else {
      setError('Monnify did not return a payment page.')
    }
  }

  async function verify() {
    if (!payment) return
    setBusy(true); setError('')
    const response = await fetch('/api/payments/monnify/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: payment.reference }),
    })
    const result = await response.json()
    setBusy(false)
    if (!response.ok) { setError(result.error || 'Could not verify the payment.'); return }
    setPayment({ ...payment, status: result.status })
    if (result.status === 'successful') router.refresh()
  }

  function goToCheckout() {
    if (payment?.checkout_url) window.location.href = payment.checkout_url
  }

  if (loading) return <div className="payment-panel"><span className="spinner" /></div>

  const successful = payment?.status === 'successful' || returnState === 'paid'

  return <div className="payment-panel">
    <div className="payment-amount"><span>Amount due</span><strong>{formatNaira(amountKobo)}</strong></div>
    {testMode && payment?.status !== 'successful' && <p className="test-mode-badge">Test mode, no real money moves</p>}

    {successful ? (
      <div className="payment-complete"><span><BadgeCheck /></span><h3>Payment confirmed</h3><p>Reference: {payment?.reference}</p></div>
    ) : testMode && payment ? (
      <>
        <p className="rrr-channels">This is a simulated payment. Tapping the button below marks it as paid instantly.</p>
        <button type="button" disabled={busy} onClick={verify} className="adm-button button-primary full-button">
          {busy ? <><Loader2 className="spin" />Verifying…</> : 'Simulate successful payment'}
        </button>
      </>
    ) : payment?.status === 'pending' ? (
      <>
        {payment.checkout_url && (
          <button type="button" onClick={goToCheckout} className="adm-button button-primary full-button">
            <ExternalLink />Continue to Monnify payment
          </button>
        )}
        <button type="button" disabled={busy} onClick={verify} className="adm-button button-secondary full-button">
          {busy ? <><Loader2 className="spin" />Checking…</> : <><RefreshCw />I have paid, check status</>}
        </button>
        {returnState === 'failed' && <Toast message="The payment was not completed. You can try again." onDismiss={() => setReturnState(null)} />}
      </>
    ) : (
      <>
        <button type="button" disabled={busy} onClick={initiate} className="adm-button button-primary full-button">
          {busy ? <><Loader2 className="spin" />Starting…</> : <><ExternalLink />Pay with Monnify</>}
        </button>
        {(payment?.status === 'failed' || returnState === 'error') && (
          <Toast message="Something went wrong starting the payment. Please try again." onDismiss={() => setError('')} />
        )}
      </>
    )}

    {error && <Toast message={error} onDismiss={() => setError('')} />}
  </div>
}
