import Link from 'next/link'
import { ArrowLeft, Building2, CalendarDays, Globe, Info, MapPin } from 'lucide-react'
import AdminInstitutionCourses from '@/components/admin/InstitutionCourses'
import { typeLabel } from '@/components/dashboard/InstitutionsBrowser'
import { requireAdmin } from '@/lib/auth'
import { getInstitutionDetail } from '@/lib/institutions-source'

function initials(name: string) {
  return name.replace(/^The /, '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default async function AdminInstitutionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const result = /^[a-z0-9-]{1,80}$/.test(id) ? await getInstitutionDetail(id) : null
  if (!result) {
    return <div className="mx-auto max-w-7xl"><div className="rounded-2xl border border-[#dfe3da] bg-white p-12 text-center">
      <h2 className="text-xl font-bold">Institution not found</h2>
      <Link href="/admin/institutions" className="mt-4 inline-block rounded-xl bg-[#17351f] px-5 py-2.5 text-sm font-bold text-white">Browse institutions</Link>
    </div></div>
  }
  const { institution, courseCount } = result
  return <div className="mx-auto max-w-7xl">
    <Link href="/admin/institutions" className="flex w-fit items-center gap-2 text-sm font-semibold text-[#667069] hover:text-[#17351f]"><ArrowLeft className="size-4" />Back to institutions</Link>
    <section className="mt-4 rounded-2xl border border-[#dfe3da] bg-white p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#17351f] text-lg font-black text-[#d8ff63]">{initials(institution.name)}</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#54725d]">{typeLabel(institution.type)} · <span className="capitalize">{institution.ownership}</span></p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{institution.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-[#667069]"><MapPin className="size-3.5" />{institution.state}</p>
          </div>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-[#eef2ea] px-4 py-2 text-sm font-bold text-[#31583b]"><Building2 className="size-4" />{courseCount} courses</span>
      </div>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-[#f4f6f1] p-4"><dt className="text-xs font-semibold uppercase tracking-wider text-[#667069]">Type</dt><dd className="mt-1 text-sm font-bold">{typeLabel(institution.type)}</dd></div>
        <div className="rounded-xl bg-[#f4f6f1] p-4"><dt className="text-xs font-semibold uppercase tracking-wider text-[#667069]">Ownership</dt><dd className="mt-1 text-sm font-bold capitalize">{institution.ownership}</dd></div>
        <div className="rounded-xl bg-[#f4f6f1] p-4"><dt className="text-xs font-semibold uppercase tracking-wider text-[#667069]">Established</dt><dd className="mt-1 flex items-center gap-1 text-sm font-bold"><CalendarDays className="size-3.5" />{institution.yearEstablished ?? 'Not recorded'}</dd></div>
        <div className="rounded-xl bg-[#f4f6f1] p-4"><dt className="text-xs font-semibold uppercase tracking-wider text-[#667069]">Website</dt><dd className="mt-1 truncate text-sm font-bold">{institution.website ? <a href={institution.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#31583b] hover:underline"><Globe className="size-3.5 shrink-0" />{institution.website.replace(/^https?:\/\//, '')}</a> : 'Not recorded'}</dd></div>
      </dl>
    </section>
    <AdminInstitutionCourses institutionId={institution.id} total={courseCount} />
    <p className="mt-4 flex items-start gap-2 text-sm text-[#667069]"><Info className="mt-0.5 size-4 shrink-0" />Course lists are indicative and follow standard Nigerian qualification patterns. Confirm details with the institution before publishing.</p>
  </div>
}
