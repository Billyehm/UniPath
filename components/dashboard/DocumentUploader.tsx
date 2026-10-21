'use client'

import { FormEvent, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DocumentUploader() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('')
    const response = await fetch('/api/documents', { method: 'POST', body: new FormData(event.currentTarget) })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Upload failed'); setLoading(false); return }
    event.currentTarget.reset(); setOpen(false); setLoading(false); router.refresh()
  }

  return <div>{open ? <form onSubmit={upload} className="rounded-2xl border border-[#dfe3da] bg-white p-4 shadow-lg"><label className="block text-sm font-bold">Document type<select name="documentType" className="mt-1 h-11 w-full rounded-xl border border-[#cfd6cc] bg-white px-3 font-normal" required><option value="WAEC Result">WAEC Result</option><option value="JAMB Profile">JAMB Profile</option><option value="Passport Photograph">Passport Photograph</option><option value="Other">Other</option></select></label><label className="mt-3 block text-sm font-bold">File<input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="mt-1 block w-full rounded-xl border border-[#cfd6cc] p-2 text-sm font-normal" required /></label>{error && <p className="mt-2 text-sm text-rose-700">{error}</p>}<div className="mt-4 flex gap-2"><button disabled={loading} className="rounded-full bg-[#17351f] px-5 py-2.5 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-50">{loading ? <span className="flex items-center gap-2"><span className="spinner" />Uploading…</span> : 'Upload'}</button><button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2.5 text-sm font-bold">Cancel</button></div></form> : <button onClick={() => setOpen(true)} className="flex min-h-11 items-center gap-2 rounded-full bg-[#17351f] px-5 text-sm font-bold text-white"><UploadCloud className="size-4" />Upload document</button>}</div>
}
