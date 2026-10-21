import ProfileForm from '@/components/dashboard/ProfileForm'
import { requireUser } from '@/lib/auth'
import { getApplicantAccount } from '@/lib/data/application'
import { notFound } from 'next/navigation'

export default async function ProfilePage() {
  const authenticated = await requireUser()
  const account = await getApplicantAccount(authenticated.id)
  if (!account.profile) notFound()
  return <div className="page-stack narrow-page"><section className="page-intro"><div><p className="eyebrow-dark">Student profile</p><h2>Your account and application details.</h2></div></section><ProfileForm user={account.user} profile={account.profile} application={account.application} /></div>
}
