import UpdatesBrowser from '@/components/dashboard/UpdatesBrowser'
import { requireUser } from '@/lib/auth'
import { getUniversityUpdates } from '@/lib/data/application'

export default async function UpdatesPage() {
  const user = await requireUser()
  return <div className="page-stack"><section className="page-intro"><div><p className="eyebrow-dark">University updates</p><h2>Important changes, all in one place.</h2></div></section><UpdatesBrowser updates={await getUniversityUpdates(user.id)} /></div>
}
