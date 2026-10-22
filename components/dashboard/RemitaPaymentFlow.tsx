'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, Copy, Loader2, RefreshCw } from 'lucide-react'
import { formatNaira } from '@/lib/remita'

type Payment = { id: string; rrr: string; amount_kobo: number; status: 'pending' | 'successful' | 'failed'; verified_at: string | null }

export default function RemitaPaymentFlow({ requirementId, amountKobo }: { requirementId: string; amountKobo: number }) {
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/payments/remita/latest?requirementId=${requirementId}`)
      .then((res) => res.json())
      .then((data) => setPayment(data.payment ?? null))
      .catch(() => setPayment(null))
      .finally(() => setLoading(false))
  }, [requirementId])

  async function initiate() {
    setBusy(true); setError('')
    const response = await fetch('/api/payments/remita/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirementId }),
    })
    const result = await response.json()
    setBusy(false)
    if (!response.ok) { setError(result.error || 'Could not start the payment.'); return }
    setPayment({ id: result.paymentId, rrr: result.rrr, amount_kobo: result.amountKobo, status: 'pending', verified_at: null })
  }

  async function verify() {
    if (!payment) return
    setBusy(true); setError('')
    const response = await fetch('/api/payments/remita/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: payment.id }),
    })
    const result = await response.json()
    setBusy(false)
    if (!response.ok) { setError(result.error || 'Could not verify the payment.'); return }
    setPayment({ ...payment, status: result.status })
    if (result.status === 'successful') router.refresh()
  }

  function copyRRR() {
    if (!payment) return
    void navigator.clipboard.writeText(payment.rrr).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) return <div className="payment-panel"><span className="spinner" /></div>

  return <div className="payment-panel">
    <div className="payment-amount"><span>Amount due</span><strong>{formatNaira(amountKobo)}</strong></div>

    {payment?.status === 'successful' ? (
      <div className="payment-complete"><span><BadgeCheck /></span><h3>Payment confirmed</h3><p>Reference: {payment.rrr}</p></div>
    ) : payment ? (
      <>
        <div className="rrr-box"><span>Your Remita reference (RRR)</span><strong>{payment.rrr}</strong><button type="button" onClick={copyRRR} className="adm-button button-secondary">{copied ? 'Copied' : <><Copy />Copy</>}</button></div>
        <p className="rrr-channels">Pay with this reference on remita.net, your bank app, USSD, or at any bank branch.</p>
        <button type="button" disabled={busy} onClick={verify} className="adm-button button-primary full-button">
          {busy ? <><Loader2 className="spin" />Verifying…</> : <><RefreshCw />I have paid, verify payment</>}
        </button>
        {payment.status === 'failed' && <button type="button" disabled={busy} onClick={initiate} className="adm-button button-secondary full-button">Generate a new reference</button>}
      </>
    ) : (
      <button type="button" disabled={busy} onClick={initiate} className="adm-button button-primary full-button">
        {busy ? <><Loader2 className="spin" />Generating…</> : 'Generate payment reference'}
      </button>
    )}

    {error && <p className="form-message error-message" role="alert">{error}</p>}
  </div>
}
