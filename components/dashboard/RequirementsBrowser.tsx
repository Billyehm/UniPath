'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import RequirementsList from '@/components/dashboard/RequirementsList'
import type { RequirementStatus } from '@/lib/database.types'
import type { Requirement } from '@/lib/models'

const filters: Array<'all' | RequirementStatus> = ['all', 'action_needed', 'processing', 'not_started', 'completed']
const label = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export default function RequirementsBrowser({ requirements }: { requirements: Requirement[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>('all')
  const [query, setQuery] = useState('')
  const visible = useMemo(() => requirements.filter((item) => (filter === 'all' || item.status === filter) && item.title.toLowerCase().includes(query.toLowerCase())), [filter, query, requirements])
  return <><section className="summary-strip">{(['completed', 'processing', 'action_needed', 'not_started'] as RequirementStatus[]).map((status) => <div key={status}><strong>{requirements.filter((item) => item.status === status).length}</strong><span>{label(status)}</span></div>)}</section><section className="adm-card"><div className="list-toolbar"><div className="filter-row" role="group" aria-label="Filter requirements">{filters.map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{label(item)}</button>)}</div><label className="search-field"><Search /><span className="sr-only">Search requirements</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search requirements" /></label></div>{visible.length ? <RequirementsList items={visible} /> : <div className="empty-state"><Search /><h3>No requirements found</h3></div>}</section></>
}
