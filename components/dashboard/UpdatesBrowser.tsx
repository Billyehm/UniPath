'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Megaphone } from 'lucide-react'
import type { UniversityUpdate } from '@/lib/models'
import { formatDate } from '@/lib/format'

const filters = ['selected', 'important', 'deadline'] as const
export default function UpdatesBrowser({ updates }: { updates: UniversityUpdate[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>('selected')
  const visible = useMemo(() => updates.filter((update) => filter === 'selected' ? update.selected : update.category === filter), [filter, updates])
  return <section className="adm-card"><div className="filter-row update-filters" role="group" aria-label="Filter updates">{filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item === 'selected' ? 'Your updates' : item[0].toUpperCase() + item.slice(1)}</button>)}</div><div className="updates-list">{visible.map((update) => <article className="update-row" key={update.id}><span className="update-icon"><Megaphone /></span><div><div className="update-heading"><span className={`category category-${update.category}`}>{update.category}</span><time><CalendarDays />{formatDate(update.publishedAt)}</time></div><p className="update-university">{update.university}</p><h3>{update.title}</h3><p>{update.description}</p>{update.universityId && <Link href={`/dashboard/universities/${update.universityId}`}>View university <ArrowRight /></Link>}</div></article>)}{!visible.length && <div className="empty-state compact-empty"><Megaphone /><h3>No updates in this view</h3></div>}</div></section>
}
