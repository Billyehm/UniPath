import { Building2, MapPin } from 'lucide-react'
import { requireAdmin } from '@/lib/auth'
import { getUniversities } from '@/lib/data/application'

export default async function AdminUniversitiesPage() {
  const admin = await requireAdmin()
  const universities = await getUniversities(admin.id)
  return <div className="mx-auto max-w-7xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Content directory</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Universities</h2><section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{universities.map((university) => <article key={university.id} className="rounded-2xl border border-[#dfe3da] bg-white p-5"><span className="grid size-11 place-items-center rounded-xl bg-[#17351f] font-black text-[#d8ff63]">{university.shortName.slice(0, 2)}</span><h3 className="mt-5 font-bold">{university.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-[#667069]"><MapPin className="size-3.5" />{university.location}</p><p className="mt-4 text-sm leading-6 text-[#667069]">{university.programmes}</p><button className="mt-5 flex items-center gap-2 text-sm font-bold text-[#31583b]"><Building2 className="size-4" />View record</button></article>)}</section></div>
}
