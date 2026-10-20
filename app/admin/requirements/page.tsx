import RequirementsManager from '@/components/admin/RequirementsManager'
import { requireAdmin } from '@/lib/auth'
import { getAdminRequirements } from '@/lib/data/admin'

export default async function AdminRequirementsPage() {
  await requireAdmin()
  const requirements = await getAdminRequirements()
  return <div className="mx-auto max-w-7xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Application setup</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Requirements</h2><p className="mt-2 max-w-2xl text-[#667069]">Changes appear across applicant dashboards.</p><div className="mt-7"><RequirementsManager initialRequirements={requirements} /></div></div>
}
