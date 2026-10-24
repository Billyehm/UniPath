import ProfileForm from '@/components/dashboard/ProfileForm'
import { requireUser } from '@/lib/auth'
import { getApplicantAccount } from '@/lib/data/application'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ProfilePage() {
  const authenticated = await requireUser()
  const account = await getApplicantAccount(authenticated.id)
  if (!account.profile) notFound()
  const supabase = await createClient()
  const avatarUrl = account.profile.avatar_path ? supabase.storage.from('avatars').getPublicUrl(account.profile.avatar_path).data.publicUrl : null
  return <div className="page-stack narrow-page"><section className="page-intro"><div><p className="eyebrow-dark">Student profile</p><h2>Your account and application details.</h2></div></section><ProfileForm user={account.user} profile={account.profile} application={account.application} avatarUrl={avatarUrl} /></div>
}
