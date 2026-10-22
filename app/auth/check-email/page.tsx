'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, GraduationCap, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resending, setResending] = useState(false)
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success')

  async function resend() {
    if (!email || resending) return
    setResending(true)
    setNotice('')
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setNotice(error.message)
      setNoticeType('error')
    } else {
      setNotice('Confirmation email resent. Check your inbox.')
      setNoticeType('success')
    }
    setResending(false)
  }

  return <div className="auth-form-wrap">
    <div className="auth-mobile-brand"><GraduationCap />UniPath</div>
    <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700"><MailCheck className="size-8" /></div>
    <p className="eyebrow-dark mt-6 text-center">Almost there</p>
    <h2 className="text-center">Check your email</h2>
    <p className="mt-3 text-center text-[#667069]">We sent a confirmation link to <strong className="text-[#17351f]">{email || 'your email address'}</strong>. Click the link to verify your account, then sign in.</p>
    <p className="mt-3 text-center text-sm text-[#667069]">Can’t find it? Check your spam or junk folder.</p>
    {notice && <p role="alert" className={noticeType === 'success' ? 'mt-4 text-center text-sm font-medium text-emerald-700' : 'mt-4 text-center text-sm font-medium text-red-600'}>{notice}</p>}
    <div className="mt-6">
      <button type="button" onClick={resend} disabled={resending || !email} className="adm-button button-primary full-button">{resending ? <><span className="spinner" />Resending…</> : 'Resend confirmation email'}</button>
    </div>
    <div className="auth-switch"><Link href="/auth">Back to sign in</Link></div>
  </div>
}

export default function CheckEmailPage() {
  return <main className="auth-shell">
    <section className="auth-story"><Link href="/" className="auth-brand"><span><GraduationCap /></span>UniPath</Link><div><p className="auth-eyebrow">A clearer path to university</p><h1>Everything you need to keep moving forward.</h1><ul><li><Check />See what you’ve completed</li><li><Check />Know what you’re waiting for</li><li><Check />Understand what to do next</li></ul></div><p>Built for Nigerian university applicants.</p></section>
    <section className="auth-form-side"><Suspense><CheckEmailContent /></Suspense></section>
  </main>
}
