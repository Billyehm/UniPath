'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Search, Send, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { University } from '@/lib/models'

export default function UpdateComposer({ universities }: { universities: University[] }) {
  const router = useRouter()
  const [target, setTarget] = useState<'all' | 'university'>('all')
  const [query, setQuery] = useState('')
  const [universityId, setUniversityId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<'general' | 'important' | 'deadline'>('general')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const selected = universities.find((university) => university.id === universityId)
  const matches = useMemo(() => universities.filter((university) => university.name.toLowerCase().includes(query.toLowerCase()) || university.shortName.toLowerCase().includes(query.toLowerCase())).slice(0, 6), [query, universities])

  async function publish(event: FormEvent) {
    event.preventDefault()
    if (target === 'university' && !universityId) { setMessage('Select a university before publishing.'); return }
    setSaving(true); setMessage('')
    const response = await fetch('/api/admin/updates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, category, universityId: target === 'university' ? universityId : null }) })
    const result = await response.json()
    if (!response.ok) { setMessage(result.error || 'Unable to publish update.'); setSaving(false); return }
    setTitle(''); setDescription(''); setCategory('general'); setQuery(''); setUniversityId(null); setTarget('all'); setSaving(false); setMessage('Update published.')
    router.refresh()
  }

  return <form onSubmit={publish} className="mt-7 rounded-3xl border border-[#dfe3da] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold">Publish an update</h3><p className="mt-1 text-sm text-[#667069]">All applicants or one university.</p></div><div className="flex rounded-xl bg-[#eff4ea] p-1 text-sm font-bold"><button type="button" onClick={() => { setTarget('all'); setUniversityId(null) }} className={`rounded-lg px-3 py-2 ${target === 'all' ? 'bg-white text-[#17351f] shadow-sm' : 'text-[#54725d]'}`}>All students</button><button type="button" onClick={() => setTarget('university')} className={`rounded-lg px-3 py-2 ${target === 'university' ? 'bg-white text-[#17351f] shadow-sm' : 'text-[#54725d]'}`}>University</button></div></div>{target === 'university' && <div className="mt-5 rounded-2xl bg-[#f7f8f3] p-4"><label className="flex h-11 items-center gap-2 rounded-xl border border-[#cfd6cc] bg-white px-3"><Search className="size-4 text-[#667069]" /><input value={query} onChange={(event) => { setQuery(event.target.value); setUniversityId(null) }} placeholder="Search a university" className="min-w-0 flex-1 outline-none" /></label>{selected ? <div className="mt-3 flex items-center justify-between rounded-xl border border-[#b8cdbb] bg-white px-3 py-2 text-sm"><span><strong>{selected.name}</strong><span className="ml-2 text-[#667069]">{selected.shortName}</span></span><button type="button" onClick={() => setUniversityId(null)} aria-label="Clear selected university"><X className="size-4" /></button></div> : query && <div className="mt-3 grid gap-2">{matches.map((university) => <button type="button" key={university.id} onClick={() => { setUniversityId(university.id); setQuery('') }} className="rounded-xl border border-[#dfe3da] bg-white px-3 py-3 text-left text-sm hover:border-[#8ea992]"><strong>{university.name}</strong><span className="ml-2 text-[#667069]">{university.location}</span></button>)}{!matches.length && <p className="text-sm text-[#667069]">No university found.</p>}</div>}</div>}<div className="mt-5 grid gap-4 sm:grid-cols-[1fr_180px]"><label className="text-sm font-semibold">Title<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#cfd6cc] px-3 font-normal outline-none focus:border-[#64806b]" placeholder="Update title" required /></label><label className="text-sm font-semibold">Category<select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="mt-1 h-11 w-full rounded-xl border border-[#cfd6cc] bg-white px-3 font-normal outline-none focus:border-[#64806b]"><option value="general">Normal</option><option value="important">Important</option><option value="deadline">Deadline</option></select></label></div><label className="mt-4 block text-sm font-semibold">Message<textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 min-h-28 w-full rounded-xl border border-[#cfd6cc] p-3 font-normal outline-none focus:border-[#64806b]" placeholder="Write the update students should receive" required /></label><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className={`text-sm ${message === 'Update published.' ? 'text-emerald-700' : 'text-rose-700'}`}>{message}</p><button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#17351f] px-4 text-sm font-bold text-white disabled:opacity-60"><Send className="size-4" />{saving ? 'Publishing…' : 'Publish update'}</button></div></form>
}
