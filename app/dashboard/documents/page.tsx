import { ArrowRight, ShieldCheck } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { getUploadedDocuments } from '@/lib/data/application'
import StatusBadge from '@/components/dashboard/StatusBadge'
import type { RequirementStatus } from '@/lib/database.types'

export default async function DocumentsPage() {
  const user = await requireUser()
  const documents = await getUploadedDocuments(user.id)
  return <div className="page-stack narrow-page">
    <section className="page-intro">
      <div><p className="eyebrow-dark">My Documents</p></div>
    </section>
    <section className="adm-card overflow-hidden">
      <div className="border-b border-[#dfe3da] bg-[#f7f8f3] px-5 py-5 sm:px-7"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e1ede0] text-[#17351f]"><ShieldCheck className="size-5" /></span><div><h3 className="font-bold text-[#17231b]">Uploaded documents</h3></div></div></div>
      <div className="px-5 sm:px-7">{documents.map((document) => <a key={document.id} href={document.previewUrl || '#'} target="_blank" rel="noreferrer" className="requirement-item"><span className="requirement-copy"><strong>{document.title}</strong><span>{document.fileName}</span></span><span className="requirement-meta"><StatusBadge status={document.status as RequirementStatus} /><span className="row-arrow"><ArrowRight /></span></span></a>)}{!documents.length && <div className="py-14 text-center text-sm text-[#667069]">No documents uploaded yet.</div>}</div>
    </section>
  </div>
}
