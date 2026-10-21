import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
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
      <div className="px-5 sm:px-7">{requirements.map((requirement) => <Link key={requirement.id} href={`/dashboard/documents/${requirement.id}`} className="requirement-item document-row"><span className="requirement-copy"><strong>{requirement.title}</strong><span>{requirement.description}</span></span><span className="requirement-meta"><StatusBadge status={requirement.status} /><span className="row-arrow"><ArrowRight /></span></span></Link>)}{!requirements.length && <div className="py-14 text-center text-sm text-[#667069]">No screening requirements have been published yet.</div>}</div>
    </section>
  </div>
}
