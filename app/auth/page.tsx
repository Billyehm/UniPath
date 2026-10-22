'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const SESSION_COOKIE = 'unipath_last_active'
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

function stampSession() {
  document.cookie = `${SESSION_COOKIE}=${Date.now()}; path=/; max-age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax`
}

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')

  function showMessage(text: string, type: 'success' | 'error') {
    setMessage(text)
    setMessageType(type)
  }

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('expired') === '1') {
      showMessage('You have been signed out after 5 hours of inactivity. Sign in again to continue.', 'error')
    }
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')
    const supabase = createClient()

    if (mode === 'reset') {
      const normalizedEmail = email.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        showMessage('Enter a valid email address before requesting a reset link.', 'error')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset` })
      showMessage(error ? error.message : 'If an account exists for this email, a password-reset link has been sent. Can\u2019t find it? Check your spam or junk folder.', error ? 'error' : 'success')
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      const fullName = String(form.get('name') ?? '')
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` } })
      if (error) { showMessage(error.message, 'error'); setLoading(false); return }
      if (!data.session) { window.location.href = `/auth/check-email?email=${encodeURIComponent(email)}`; return }
      stampSession()
      window.location.href = '/dashboard'
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) { showMessage(error?.message || 'Unable to sign in', 'error'); setLoading(false); return }
    const { data: staff } = await supabase.from('admin_users').select('user_id, roles(name)').eq('user_id', data.user.id).eq('is_active', true).maybeSingle()
    const roleName = (staff?.roles as unknown as { name: string } | null)?.name
    stampSession()
    window.location.href = staff ? roleName === 'support_agent' ? '/admin/support' : '/admin' : '/dashboard'
  }

  return <main className="auth-shell">
    <section className="auth-story"><Link href="/" className="auth-brand"><span><GraduationCap /></span>UniPath</Link><div><p className="auth-eyebrow">A clearer path to university</p><h1>Everything you need to keep moving forward.</h1><ul><li><Check />See what you’ve completed</li><li><Check />Know what you’re waiting for</li><li><Check />Understand what to do next</li></ul></div><p>Built for Nigerian university applicants.</p></section>
    <section className="auth-form-side"><div className="auth-form-wrap"><div className="auth-mobile-brand"><GraduationCap />UniPath</div><p className="eyebrow-dark">{mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Start your application' : 'Account recovery'}</p><h2>{mode === 'signin' ? 'Sign in to UniPath' : mode === 'signup' ? 'Create your account' : 'Reset your password'}</h2>
      <form className="auth-form" onSubmit={submit}>{mode === 'signup' && <label>Full name<input name="name" autoComplete="name" placeholder="Enter your full name" required /></label>}<label>Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>{mode !== 'reset' && <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} name="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" minLength={8} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>}{mode === 'signin' && <div className="auth-options"><label><input type="checkbox" />Remember me</label><button type="button" onClick={() => { setMode('reset'); setMessage('') }}>Forgot password?</button></div>}<button className="adm-button button-primary full-button" disabled={loading} type="submit">{loading ? <><span className="spinner" />Please wait…</> : <>{mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'} <ArrowRight /></>}</button></form>
      {message && <p role="alert" className={messageType === 'success' ? 'mt-4 text-center text-sm font-medium text-emerald-700' : 'mt-4 text-center text-sm font-medium text-red-600'}>{message}</p>}
      {mode === 'reset' ? <div className="auth-switch">Remembered your password? <button onClick={() => { setMode('signin'); setMessage('') }}>Sign in</button></div> : <div className="auth-switch">{mode === 'signin' ? 'New to UniPath?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}>{mode === 'signin' ? 'Create an account' : 'Sign in'}</button></div>}<p className="auth-terms">By continuing, you agree to UniPath’s Terms and Privacy Policy.</p></div></section>
  </main>
}
