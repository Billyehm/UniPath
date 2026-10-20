'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const password = String(new FormData(event.currentTarget).get('password') ?? '')
    if (password.length < 8) {
      setMessage('Your new password must be at least 8 characters long.')
      setLoading(false)
      return
    }
    const { error } = await createClient().auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }
    router.replace('/dashboard')
    router.refresh()
  }

  return <main className="auth-shell"><section className="auth-story"><Link href="/" className="auth-brand"><span><GraduationCap /></span>UniPath</Link><div><p className="auth-eyebrow">Account recovery</p><h1>Choose a new password.</h1><p>Use at least eight characters to keep your account secure.</p></div></section><section className="auth-form-side"><div className="auth-form-wrap"><div className="auth-mobile-brand"><GraduationCap />UniPath</div><p className="eyebrow-dark">Password reset</p><h2>Set a new password</h2><p>Your reset link has verified your account. Choose a password you have not used elsewhere.</p><form className="auth-form" onSubmit={submit}><label>New password<div className="password-field"><input type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label><button className="adm-button button-primary full-button" disabled={loading} type="submit">{loading ? 'Updating…' : 'Update password'} <ArrowRight /></button></form>{message && <p role="alert" className="mt-4 text-center text-sm text-rose-700">{message}</p>}<div className="auth-switch">Want to sign in instead? <Link href="/auth">Sign in</Link></div></div></section></main>
}
