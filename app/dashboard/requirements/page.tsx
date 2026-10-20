import RequirementsBrowser from '@/components/dashboard/RequirementsBrowser'
import { requireUser } from '@/lib/auth'
import { getRequirements } from '@/lib/data/application'

export default async function RequirementsPage() {
  const user = await requireUser()
  const requirements = await getRequirements(user.id)
  return <div className="page-stack"><section className="page-intro"><div><p className="eyebrow-dark">Application checklist</p><h2>Know exactly what comes next.</h2><p>Open a requirement to view its status.</p></div></section><RequirementsBrowser requirements={requirements} /></div>
}
