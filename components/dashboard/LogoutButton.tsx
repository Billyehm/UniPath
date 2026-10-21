'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout() {
    setLoading(true)
    const { error } = await createClient().auth.signOut()
    if (error) {
      setLoading(false)
      return
    }
    router.replace('/auth')
    router.refresh()
  }

  return <button type="button" className="logout-setting" onClick={logout} disabled={loading}>
    <span><LogOut /></span>
    <div><strong className="flex items-center gap-2">{loading ? <><span className="spinner" />Signing out…</> : 'Log out'}</strong><p>Sign out on this device</p></div>
    <ChevronRight />
  </button>
}
