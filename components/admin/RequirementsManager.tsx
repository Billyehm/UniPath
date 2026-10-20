'use client'

import { FormEvent, useState } from 'react'
import { ChevronDown, FileText, Plus, Trash2, Type } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { AdminRequirement } from '@/lib/models'

type FormValues = { title: string; subtitle: string; guidance: string; submissionType: AdminRequirement['submissionType'] }
const blankForm: FormValues = { title: '', subtitle: '', guidance: '', submissionType: 'file' }
const modeLabel = { file: 'File upload', text: 'Text response', both: 'File upload + text' }

const inputClass = 'mt-1 h-11 w-full rounded-xl border border-[#cfd6cc] px-3 font-normal outline-none focus:border-[#64806b]'
const areaClass = 'mt-1 min-h-20 w-full rounded-xl border border-[#cfd6cc] p-3 font-normal outline-none focus:border-[#64806b]'

export default function RequirementsManager({ initialRequirements }: { initialRequirements: AdminRequirement[] }) {
  const router = useRouter()
  const [requirements, setRequirements] = useState(initialRequirements)
  const [newForm, setNewForm] = useState<FormValues>(blankForm)
  const [editForm, setEditForm] = useState<FormValues>(blankForm)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function changeNew<K extends keyof FormValues>(key: K, value: FormValues[K]) { setNewForm((current) => ({ ...current, [key]: value })) }
  function changeEdit<K extends keyof FormValues>(key: K, value: FormValues[K]) { setEditForm((current) => ({ ...current, [key]: value })) }

  function openRow(item: AdminRequirement) {
    setExpandedId(item.id)
    setEditForm({ title: item.title, subtitle: item.subtitle, guidance: item.guidance || '', submissionType: item.submissionType })
    setError('')
  }

  function closeRow() { setExpandedId(null); setEditForm(blankForm); setError('') }

  function toggleRow(item: AdminRequirement) {
    if (expandedId === item.id) closeRow()
    else openRow(item)
  }

  async function create(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('')
    const response = await fetch('/api/admin/requirements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newForm) })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Unable to save requirement.'); setSaving(false); return }
    const saved: AdminRequirement = { id: result.id, title: newForm.title.trim(), subtitle: newForm.subtitle.trim(), guidance: newForm.guidance.trim() || null, submissionType: newForm.submissionType, displayOrder: requirements.length, isActive: true }
    setRequirements((items) => [...items, saved])
    setNewForm(blankForm); setSaving(false); router.refresh()
  }

  async function saveEdit(event: FormEvent, item: AdminRequirement) {
    event.preventDefault(); setSaving(true); setError('')
    const response = await fetch(`/api/admin/requirements/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Unable to save requirement.'); setSaving(false); return }
    const saved: AdminRequirement = { ...item, title: editForm.title.trim(), subtitle: editForm.subtitle.trim(), guidance: editForm.guidance.trim() || null, submissionType: editForm.submissionType }
    setRequirements((items) => items.map((entry) => entry.id === item.id ? saved : entry))
    closeRow(); setSaving(false); router.refresh()
  }

  async function remove(item: AdminRequirement) {
    if (!window.confirm(`Delete “${item.title}”? This also removes its checklist entry for every student.`)) return
    setSaving(true); setError('')
    const response = await fetch(`/api/admin/requirements/${item.id}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Unable to delete requirement.'); setSaving(false); return }
    setRequirements((items) => items.filter((entry) => entry.id !== item.id))
    closeRow(); setSaving(false); router.refresh()
  }

  function fields(form: FormValues, change: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void) {
    return <>
      <label className="block text-sm font-semibold">Title
        <input value={form.title} onChange={(event) => change('title', event.target.value)} className={inputClass} placeholder="e.g. JAMB UTME result slip" required />
      </label>
      <label className="block text-sm font-semibold">Subtitle
        <textarea value={form.subtitle} onChange={(event) => change('subtitle', event.target.value)} className={areaClass} placeholder="A short description shown under the title" required />
      </label>
      <label className="block text-sm font-semibold">Guidance text
        <textarea value={form.guidance} onChange={(event) => change('guidance', event.target.value)} className={`${areaClass} min-h-28`} placeholder="Instructions the student should follow" />
      </label>
      <fieldset>
        <legend className="text-sm font-semibold">Submission type</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {(['file', 'text', 'both'] as const).map((mode) => (
            <label key={mode} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${form.submissionType === mode ? 'border-[#64806b] bg-[#eff4ea]' : 'border-[#dfe3da]'}`}>
              <input type="radio" checked={form.submissionType === mode} onChange={() => change('submissionType', mode)} className="accent-[#31583b]" />
              <span className="grid size-8 place-items-center rounded-lg bg-white text-[#54725d]">{mode === 'file' ? <FileText className="size-4" /> : <Type className="size-4" />}</span>
              <span><strong>{modeLabel[mode]}</strong>{mode === 'both' && <small className="block text-[#667069]">Student provides both items</small>}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-[#dfe3da] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#eff4ea] text-[#17351f]"><Plus className="size-5" /></span>
            <div>
              <h3 className="font-bold">New requirement</h3>
              
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNewForm((open) => !open)}
            aria-expanded={showNewForm}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#17351f] px-5 text-sm font-bold text-white"
          >
            <Plus className={`size-4 transition-transform ${showNewForm ? 'rotate-45' : ''}`} />{showNewForm ? 'Close' : 'New requirement'}
          </button>
        </div>
        {showNewForm && (
          <form onSubmit={create} className="mt-6 space-y-4 border-t border-[#edf0e9] pt-6">
            {fields(newForm, changeNew)}
            {error && !expandedId && <p className="text-sm text-rose-700">{error}</p>}
            <button disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#17351f] px-6 text-sm font-bold text-white disabled:opacity-60">
              <Plus className="size-4" />{saving ? 'Saving…' : 'Add requirement'}
            </button>
          </form>
        )}
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#dfe3da] bg-white">
        <div className="border-b border-[#dfe3da] px-5 py-5 sm:px-6">
          <h3 className="font-bold">Published requirements</h3>
          <p className="mt-1 text-sm text-[#667069]">Click one to edit it.</p>
        </div>
        <div className="divide-y divide-[#edf0e9]">
          {requirements.map((item, index) => {
            const expanded = expandedId === item.id
            return (
              <article key={item.id}>
                <button
                  type="button"
                  onClick={() => toggleRow(item)}
                  aria-expanded={expanded}
                  className={`flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#f7f9f4] sm:px-6 ${expanded ? 'bg-[#f7f9f4]' : ''}`}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eff4ea] text-sm font-bold text-[#31583b]">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-bold">{item.title}</span>
                  <span className="hidden rounded-full bg-[#f0f4ec] px-2.5 py-1 text-xs font-bold text-[#54725d] sm:inline">{modeLabel[item.submissionType]}</span>
                  <ChevronDown className={`size-5 shrink-0 text-[#54725d] transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <form onSubmit={(event) => saveEdit(event, item)} className="space-y-4 border-t border-[#edf0e9] bg-[#fbfdf9] px-5 py-5 sm:px-6">
                    {fields(editForm, changeEdit)}
                    {error && <p className="text-sm text-rose-700">{error}</p>}
                    <div className="flex flex-wrap gap-2">
                      <button disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#17351f] px-6 text-sm font-bold text-white disabled:opacity-60">
                        {saving ? 'Saving…' : 'Save changes'}
                      </button>
                      <button type="button" onClick={closeRow} className="h-11 rounded-xl border border-[#cfd6cc] px-4 text-sm font-bold">Cancel</button>
                      <button type="button" onClick={() => remove(item)} disabled={saving} className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                        <Trash2 className="size-4" />Delete
                      </button>
                    </div>
                  </form>
                )}
              </article>
            )
          })}
          {!requirements.length && <div className="px-6 py-16 text-center text-sm text-[#667069]">No requirements yet. Add the first one using the form above.</div>}
        </div>
      </section>
    </div>
  )
}
