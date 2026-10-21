import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'
import { isSupabaseConfigured, getSupabaseEnv } from '@/lib/supabase/env'

const authRoutes = ['/dashboard', '/admin', '/operations']

const LAST_ACTIVE_COOKIE = 'unipath_last_active'
const SESSION_TTL_MS = 5 * 60 * 60 * 1000 // 5 hours of inactivity
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next({ request })

  let response = NextResponse.next({ request })
  const { url, publishableKey } = getSupabaseEnv()
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  const pathname = request.nextUrl.pathname
  const needsAuth = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (needsAuth && !userId) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth'
    loginUrl.searchParams.set('next', pathname)
    const redirect = NextResponse.redirect(loginUrl)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  if (userId) {
    const lastActive = Number(request.cookies.get(LAST_ACTIVE_COOKIE)?.value || 0)
    if (!lastActive) {
      // Session without an activity stamp (e.g. created before this shipped): start the window now.
      response.cookies.set(LAST_ACTIVE_COOKIE, String(Date.now()), {
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax',
      })
    } else if (Date.now() - lastActive > SESSION_TTL_MS) {
      // Away for over 5 hours: sign out and send back to the login page.
      await supabase.auth.signOut()
      const expiredUrl = request.nextUrl.clone()
      expiredUrl.pathname = '/auth'
      expiredUrl.search = ''
      expiredUrl.searchParams.set('expired', '1')
      const redirect = NextResponse.redirect(expiredUrl)
      response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
      redirect.cookies.set(LAST_ACTIVE_COOKIE, '', { path: '/', maxAge: 0 })
      return redirect
    } else if (Date.now() - lastActive > 60_000) {
      // Still active: slide the 5-hour inactivity window forward (throttled to once a minute).
      response.cookies.set(LAST_ACTIVE_COOKIE, String(Date.now()), {
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax',
      })
    }
  }

  if (userId && (pathname.startsWith('/admin') || pathname.startsWith('/operations'))) {
    const { data: staff } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()

    if (!staff) {
      const destination = request.nextUrl.clone()
      destination.pathname = '/dashboard'
      destination.search = ''
      const redirect = NextResponse.redirect(destination)
      response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
      return redirect
    }
  }

  return response
}
