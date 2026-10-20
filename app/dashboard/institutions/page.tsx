import InstitutionsBrowser from '@/components/dashboard/InstitutionsBrowser'
import { requireUser } from '@/lib/auth'
import { getInstitutions } from '@/lib/data/application'

export default async function InstitutionsPage() {
  await requireUser()
  return <div className="page-stack"><InstitutionsBrowser initialInstitutions={await getInstitutions()} /></div>
}
