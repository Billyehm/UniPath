import { CalendarDays } from 'lucide-react'
import UpdateComposer from '@/components/admin/UpdateComposer'
import { requireAdmin } from '@/lib/auth'
import { getUniversities, getUniversityUpdates } from '@/lib/data/application'

export default async function AdminUpdatesPage() {
  const admin = await requireAdmin()
  const [universityUpdates, universities] = await Promise.all([getUniversityUpdates(admin.id), getUniversities(admin.id)])
  return <div className="mx-auto max-w-6xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Content management</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">University updates</h2><p className="mt-2 text-[#667069]">Publish to all applicants or one university’s students.</p><UpdateComposer universities={universities} /><section className="mt-7 overflow-hidden rounded-2xl border border-[#dfe3da] bg-white">{universityUpdates.map((update) => <article key={update.id} className="border-b border-[#edf0e9] p-5 last:border-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#eff4ea] px-2.5 py-1 text-xs font-bold capitalize">{update.category}</span><span className="flex items-center gap-1 text-xs text-[#667069]"><CalendarDays className="size-3.5" />{new Date(update.publishedAt).toLocaleDateString()}</span></div><h3 className="mt-3 font-bold">{update.title}</h3><p className="mt-1 text-sm font-semibold text-[#54725d]">{update.university}</p><p className="mt-2 text-sm leading-6 text-[#667069]">{update.description}</p></article>)}{!universityUpdates.length && <p className="p-12 text-center text-sm text-[#667069]">No updates have been published.</p>}</section></div>
}
