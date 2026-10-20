import AdminInstitutionsBrowser from '@/components/admin/InstitutionsBrowser'
import { requireAdmin } from '@/lib/auth'
import { listInstitutions } from '@/lib/institutions-source'

export default async function AdminInstitutionsPage() {
  await requireAdmin()
  const { institutions } = await listInstitutions({ limit: 1000 })
  return <div className="mx-auto max-w-7xl">
    <p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Content directory</p>
    <h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Institutions</h2>
    <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[#667069]">Every Nigerian university, polytechnic and college of education in the directory. Open one to browse its courses.</p>
    <AdminInstitutionsBrowser initialInstitutions={institutions} />
  </div>
}
