'use client'

import { FormEvent, useState } from 'react'
import { Check, Copy, Download, FileText } from 'lucide-react'
import Link from 'next/link'
import type { ReviewStatus } from '@/lib/database.types'
import type { DocumentReviewItem } from '@/lib/models'
import StatusBadge from '@/components/shared/StatusBadge'

const adminTimestamp = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Lagos' })

export default function DocumentReviewCard({ document }: { document: DocumentReviewItem }) {
  const [status, setStatus] = useState<ReviewStatus>(document.reviewStatus)
  const [notes, setNotes] = useState(document.latestInternalNote ?? '')
  const [applicantMessage, setApplicantMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyDecision, setBusyDecision] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [copied, setCopied] = useState(false)

  async function copyWrittenResponse() {
    if (!document.writtenResponse) return
    await navigator.clipboard.writeText(document.writtenResponse)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    const decision = submitter.value as Exclude<ReviewStatus, 'pending'>
    setSaving(true); setFeedback('')
    const response = await fetch(`/api/admin/documents/${document.id}/review`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: decision, internalNotes: notes, applicantMessage }),
    })
    const result = await response.json()
    if (!response.ok) setFeedback(result.error || 'Unable to save review')
    else { setStatus(decision); setFeedback('Review saved') }
    setSaving(false); setBusyDecision(null)
  }

  return <article className="rounded-3xl border border-[#dfe3da] bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eff4ea] text-[#17351f]"><FileText className="size-5" /></span><div className="min-w-0"><h3 className="truncate font-bold">{document.originalName}</h3><p className="text-sm text-[#667069]">{document.documentType} · {(document.sizeBytes / 1024).toFixed(0)} KB</p></div></div><StatusBadge value={status} /></div>
    <div className="mt-4 rounded-2xl bg-[#f7f8f3] p-4 text-sm"><Link href={`/admin/students/${document.userId}`} className="font-bold text-[#17351f] underline-offset-2 hover:underline">{document.applicantName}</Link><p className="text-[#667069]">{document.applicantEmail}</p><p className="mt-2 text-xs text-[#7c857f]">Submitted {adminTimestamp.format(new Date(document.submittedAt))}</p></div>
    {document.writtenResponse && <div className="mt-4 rounded-2xl border border-[#dfe3da] bg-[#fafbf8] p-4"><div className="flex items-center justify-between gap-3"><strong className="text-sm">Written response</strong><button type="button" onClick={copyWrittenResponse} title="Copy written response" aria-label="Copy written response" className="grid size-9 place-items-center rounded-lg text-[#31583b] hover:bg-[#eff4ea]">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}</button></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#526157]">{document.writtenResponse}</p></div>}
    {document.kind === 'file' && (document.previewUrl ? <div className="mt-4 flex justify-end"><a href={document.previewUrl} download target="_blank" rel="noreferrer" title="Download file" aria-label="Download file" className="grid size-10 place-items-center rounded-xl border border-[#cfd6cc] text-[#31583b] hover:bg-[#eff4ea]"><Download className="size-4" /></a></div> : <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">File download is unavailable. Metadata remains available.</p>)}
    {document.kind === 'file' && <form onSubmit={submit} className="mt-4 space-y-3"><label className="block text-sm font-semibold">Internal review notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 min-h-20 w-full rounded-xl border border-[#cfd6cc] p-3 font-normal outline-none focus:border-[#64806b]" placeholder="Visible only to staff" /></label><label className="block text-sm font-semibold">Message to applicant<textarea value={applicantMessage} onChange={(event) => setApplicantMessage(event.target.value)} className="mt-1 min-h-20 w-full rounded-xl border border-[#cfd6cc] p-3 font-normal outline-none focus:border-[#64806b]" placeholder="Optional decision context" /></label><div className="grid gap-2 sm:grid-cols-3"><button name="decision" value="approved" disabled={saving} onClick={() => setBusyDecision('approved')} className="flex items-center justify-center gap-2 rounded-xl bg-[#17351f] px-3 py-3 text-xs font-bold text-white transition-transform active:scale-95 disabled:opacity-50">{busyDecision === 'approved' ? <span className="spinner" /> : null}Approve</button><button name="decision" value="resubmission_requested" disabled={saving} onClick={() => setBusyDecision('resubmission_requested')} className="flex items-center justify-center gap-2 rounded-xl bg-amber-100 px-3 py-3 text-xs font-bold text-amber-900 transition-transform active:scale-95 disabled:opacity-50">{busyDecision === 'resubmission_requested' ? <span className="spinner" /> : null}Request resubmission</button><button name="decision" value="rejected" disabled={saving} onClick={() => setBusyDecision('rejected')} className="flex items-center justify-center gap-2 rounded-xl bg-rose-100 px-3 py-3 text-xs font-bold text-rose-800 transition-transform active:scale-95 disabled:opacity-50">{busyDecision === 'rejected' ? <span className="spinner" /> : null}Reject</button></div>{feedback && <p className={`text-sm ${feedback === 'Review saved' ? 'text-emerald-700' : 'text-rose-700'}`}>{feedback}</p>}</form>}
  </article>
}
