'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const LAST_ACTIVE_COOKIE = 'unipath_last_active'
const INACTIVITY_TTL_MS = 5 * 60 * 60 * 1000 // 5 hours
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days
const ACTIVITY_THROTTLE_MS = 60_000

function readLastActive(): number {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LAST_ACTIVE_COOKIE}=([^;]*)`))
  return match ? Number(match[1]) || 0 : 0
}

function touch() {
  document.cookie = `${LAST_ACTIVE_COOKIE}=${Date.now()}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

async function expireSession() {
  try {
    await createClient().auth.signOut()
  } finally {
    window.location.href = '/auth?expired=1'
  }
}

/** Signs the user out after 5 hours without activity, even on an open page. */
export default function SessionWatchdog() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let lastTouch = 0

    const arm = () => {
      if (timer) clearTimeout(timer)
      const lastActive = readLastActive()
      if (!lastActive) return
      const remaining = lastActive + INACTIVITY_TTL_MS - Date.now()
      if (remaining <= 0) {
        void expireSession()
        return
      }
      timer = setTimeout(() => void expireSession(), remaining)
    }

    const onActivity = () => {
      const now = Date.now()
      if (now - lastTouch < ACTIVITY_THROTTLE_MS) return
      lastTouch = now
      touch()
      arm()
    }

    arm()
    window.addEventListener('pointerdown', onActivity)
    window.addEventListener('keydown', onActivity)
    document.addEventListener('visibilitychange', arm)
    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('keydown', onActivity)
      document.removeEventListener('visibilitychange', arm)
    }
  }, [])

  return null
}
