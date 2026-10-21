'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const LOGIN_AT_COOKIE = 'unipath_login_at'
const SESSION_TTL_MS = 5 * 60 * 60 * 1000 // 5 hours

function readLoginAt(): number {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOGIN_AT_COOKIE}=([^;]*)`))
  return match ? Number(match[1]) || 0 : 0
}

async function expireSession() {
  try {
    await createClient().auth.signOut()
  } finally {
    window.location.href = '/auth?expired=1'
  }
}

/** Signs the user out the moment the 5-hour session ends, even mid-page. */
export default function SessionWatchdog() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    const arm = () => {
      if (timer) clearTimeout(timer)
      const loginAt = readLoginAt()
      if (!loginAt) return
      const remaining = loginAt + SESSION_TTL_MS - Date.now()
      if (remaining <= 0) {
        void expireSession()
        return
      }
      timer = setTimeout(() => void expireSession(), remaining)
    }

    arm()
    document.addEventListener('visibilitychange', arm)
    return () => {
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', arm)
    }
  }, [])

  return null
}
