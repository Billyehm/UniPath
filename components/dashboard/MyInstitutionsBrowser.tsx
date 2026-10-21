'use client'

import { useMemo, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, MapPin, Search, X } from 'lucide-react'
import type { University } from '@/lib/models'

export default function MyInstitutionsBrowser({ initialUniversities }: { initialUniversities: University[] }) {
  const [universities, setUniversities] = useState(initialUniversities)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const visible = useMemo(() => universities.filter((item) => `${item.name} ${item.shortName} ${item.location}`.toLowerCase().includes(query.toLowerCase())), [universities, query])
  const selected = useMemo(() => universities.filter((item) => item.selected), [universities])

  async function toggle(id: string) {
    if (busyId) return
    setMessage(''); setBusyId(id)
    const response = await fetch(`/api/universities/${id}/selection`, { method: 'POST' })
    const result = await response.json()
    setBusyId(null)
    if (!response.ok) { setMessage(result.error || 'Unable to update selection'); return }
    setUniversities((items) => items.map((item) => item.id === id ? { ...item, selected: result.selected } : item))
  }

  function onCardKey(event: KeyboardEvent<HTMLElement>, id: string) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); void toggle(id) }
  }

  return <>
    <section className="page-intro"><div><p className="eyebrow-dark">My institutions</p><h2>Build your shortlist.</h2><p>Tap any institution to add it to your shortlist (up to three). <Link className="inline-link" href="/dashboard/institutions">Browse all institutions and their courses<ArrowRight /></Link></p></div><div className="selection-counter"><strong>{selected.length}</strong><span>of 3 selected</span></div></section>

    {selected.length > 0 && <section className="adm-card selected-names-card"><div className="section-heading"><div><h2>Your picks</h2><p>Tap a name to remove it</p></div></div><ul className="selected-names-list">{selected.map((item) => <li key={item.id}><button type="button" onClick={() => void toggle(item.id)} title="Remove from selection">{item.name}</button></li>)}</ul></section>}

    <section className="adm-card university-browser"><div className="university-toolbar"><label className="search-field large"><Search /><span className="sr-only">Search institutions</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, abbreviation or state" />{query && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setQuery('')}><X /></button>}</label><span>{visible.length} institutions</span></div>{message && <p className="form-message error-message" role="alert">{message}</p>}<div className="university-grid">{visible.map((university) => <article key={university.id} className={`university-card selectable${university.selected ? ' selected' : ''}`} onClick={() => void toggle(university.id)} onKeyDown={(event) => onCardKey(event, university.id)} tabIndex={0} role="checkbox" aria-checked={university.selected} aria-label={`${university.name}, ${university.selected ? 'selected' : 'not selected'}`}><div className="university-card-top"><span className="university-mark">{university.shortName.slice(0, 2)}</span>{busyId === university.id ? <span className="spinner" /> : university.selected ? <span className="picked-check"><Check /></span> : null}</div><h3>{university.name}</h3><p className="location"><MapPin />{university.location}</p><p>{university.description}</p><div className="university-update"><small>Latest update</small><strong>{university.latestUpdate || 'No current announcement'}</strong></div><Link href={`/dashboard/institutions/${university.id}`} onClick={(event) => event.stopPropagation()}>View institution <ArrowRight /></Link></article>)}</div></section>
  </>
}
