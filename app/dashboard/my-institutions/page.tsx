import MyInstitutionsBrowser from '@/components/dashboard/MyInstitutionsBrowser'
import { requireUser } from '@/lib/auth'
import { getSelectableInstitutions } from '@/lib/data/application'

export default async function MyInstitutionsPage() {
  const user = await requireUser()
  return <div className="page-stack"><MyInstitutionsBrowser initialUniversities={await getSelectableInstitutions(user.id)} /></div>
}
