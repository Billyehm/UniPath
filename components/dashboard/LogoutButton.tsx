'use client'

import { useState } from 'react'
import { ChevronRight, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  async function logout() {
    setLoading(true)
    const { error } = await createClient().auth.signOut()
    if (error) {
      setLoading(false)
      return
    }
    document.cookie = 'unipath_last_active=; path=/; max-age=0'
    window.location.href = '/auth'
  }

  return <button type="button" className="logout-setting" onClick={logout} disabled={loading}>
    <span><LogOut /></span>
    <div><strong className="flex items-center gap-2">{loading ? <><span className="spinner" />Signing out…</> : 'Log out'}</strong><p>Sign out on this device</p></div>
    <ChevronRight />
  </button>
}
