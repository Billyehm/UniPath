import { redirect } from 'next/navigation'
import { cache } from 'react'
import type { AppRole } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/server'

export type AuthenticatedUser = {
  id: string
  email: string
  role: AppRole
  displayName: string
  avatarUrl?: string | null
}

export const requireUser = cache(async (): Promise<AuthenticatedUser> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const id = data?.claims?.sub
  if (!id) redirect('/auth')

  const [{ data: user, error }, { data: profile }] = await Promise.all([
    supabase.from('users').select('id,email,role').eq('id', id).single(),
    supabase.from('user_profiles').select('full_name,avatar_path').eq('user_id', id).maybeSingle(),
  ])
  if (error || !user) redirect('/auth')

  const avatarUrl = profile?.avatar_path ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data.publicUrl : null
  return { id: user.id, email: user.email, role: user.role, displayName: profile?.full_name || user.email, avatarUrl }
})

export const requireStaff = cache(async (): Promise<AuthenticatedUser> => {
  const user = await requireUser()
  const supabase = await createClient()
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('user_id,display_name,role_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  if (!adminUser) redirect('/dashboard')

  const { data: role } = await supabase.from('roles').select('name').eq('id', adminUser.role_id).single()
  if (!role || !['admin', 'support_agent'].includes(role.name)) redirect('/dashboard')

  return { ...user, role: role.name, displayName: adminUser.display_name }
})

export async function requireAdmin() {
  const user = await requireStaff()
  if (user.role !== 'admin') redirect('/admin')
  return user
}
