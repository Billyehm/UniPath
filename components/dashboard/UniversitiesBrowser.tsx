'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, MapPin, Search } from 'lucide-react'
import type { University } from '@/lib/models'

export default function UniversitiesBrowser({ initialUniversities }: { initialUniversities: University[] }) {
  const [universities, setUniversities] = useState(initialUniversities)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const visible = useMemo(() => universities.filter((item) => `${item.name} ${item.shortName} ${item.location}`.toLowerCase().includes(query.toLowerCase())), [universities, query])
  async function toggle(id: string) {
    setMessage('')
    const response = await fetch(`/api/universities/${id}/selection`, { method: 'POST' })
    const result = await response.json()
    if (!response.ok) { setMessage(result.error || 'Unable to update selection'); return }
    setUniversities((items) => items.map((item) => item.id === id ? { ...item, selected: result.selected } : item))
  }
  const selectedCount = universities.filter((item) => item.selected).length
  return <><section className="page-intro"><div><p className="eyebrow-dark">University discovery</p><h2>Build your university shortlist.</h2><p>Search universities and choose up to three for tailored updates.</p></div><div className="selection-counter"><strong>{selectedCount}</strong><span>of 3 universities selected</span></div></section><section className="adm-card university-browser"><div className="university-toolbar"><label className="search-field large"><Search /><span className="sr-only">Search universities</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by university, abbreviation or location" /></label><span>{visible.length} universities</span></div>{message && <p className="form-message error-message" role="alert">{message}</p>}<div className="university-grid">{visible.map((university) => <article className={`university-card ${university.selected ? 'selected' : ''}`} key={university.id}><div className="university-card-top"><span className="university-mark">{university.shortName.slice(0, 2)}</span><button className={`select-university ${university.selected ? 'selected' : ''}`} onClick={() => toggle(university.id)} aria-pressed={university.selected}>{university.selected ? <><Check />Selected</> : 'Select'}</button></div><h3>{university.name}</h3><p className="location"><MapPin />{university.location}</p><p>{university.description}</p><div className="university-update"><small>Latest update</small><strong>{university.latestUpdate || 'No current announcement'}</strong></div><Link href={`/dashboard/universities/${university.id}`}>View university <ArrowRight /></Link></article>)}</div></section></>
}
