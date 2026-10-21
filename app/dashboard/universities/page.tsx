import UniversitiesBrowser from '@/components/dashboard/UniversitiesBrowser'
import { requireUser } from '@/lib/auth'
import { getDirectoryUniversities } from '@/lib/data/application'

export default async function UniversitiesPage() {
  const user = await requireUser()
  return <div className="page-stack"><UniversitiesBrowser initialUniversities={await getDirectoryUniversities(user.id)} /></div>
}
