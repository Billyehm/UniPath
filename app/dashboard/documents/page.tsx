import Link from 'next/link'
import { ArrowRight, FileText, ShieldCheck } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { getRequirements } from '@/lib/data/application'
import StatusBadge from '@/components/dashboard/StatusBadge'

export default async function DocumentsPage() {
  const user = await requireUser()
  const requirements = await getRequirements(user.id)
  return <div className="page-stack narrow-page">
    <section className="page-intro">
      <div><p className="eyebrow-dark">My Documents</p><p>Upload a clear copy for each item and follow its review status.</p></div>
    </section>
    <section className="adm-card overflow-hidden">
      <div className="border-b border-[#dfe3da] bg-[#f7f8f3] px-5 py-5 sm:px-7"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e1ede0] text-[#17351f]"><ShieldCheck className="size-5" /></span><div><h3 className="font-bold text-[#17231b]">Post-UTME screening checklist</h3></div></div></div>
      <div className="divide-y divide-[#edf0e9]">{requirements.map((requirement, index) => <Link key={requirement.id} href={`/dashboard/documents/${requirement.id}`} className="group flex gap-4 px-5 py-5 transition hover:bg-[#fafbf8] sm:items-center sm:px-7"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eff4ea] text-sm font-bold text-[#31583b]">{index + 1}</span><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f7f8f3] text-[#54725d]"><FileText className="size-5" /></span><span className="min-w-0 flex-1"><strong className="block text-[15px] text-[#17231b]">{requirement.title}</strong><span className="mt-1 block text-sm leading-6 text-[#667069]">{requirement.description}</span></span><span className="ml-auto flex shrink-0 flex-col items-end justify-center gap-2"><StatusBadge status={requirement.status} /><ArrowRight className="size-5 text-[#54725d] transition group-hover:translate-x-1" /></span></Link>)}{!requirements.length && <div className="px-5 py-14 text-center text-sm text-[#667069]">No screening requirements have been published yet.</div>}</div>
    </section>
  </div>
}
