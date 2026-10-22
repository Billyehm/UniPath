'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, Search } from 'lucide-react'
import type { Institution, InstitutionType } from '@/lib/models'
import { TYPE_LABELS, typeLabel } from '@/lib/models'
import { institutionMatchesQuery } from '@/lib/institution-search'

const TYPE_FILTERS: { value: '' | InstitutionType; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'university', label: 'Universities' },
  { value: 'polytechnic', label: 'Polytechnics' },
  { value: 'college_of_education', label: 'Colleges of Education' },
]

export default function InstitutionsBrowser({ initialInstitutions }: { initialInstitutions: Institution[] }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'' | InstitutionType>('')

  const visible = useMemo(() => {
    return initialInstitutions.filter((item) => {
      if (type && item.type !== type) return false
      return institutionMatchesQuery(item, query)
    })
  }, [initialInstitutions, query, type])

  return <>
    <section className="page-intro">
      <div>
        <p className="eyebrow-dark">Institution directory</p>
        <h2>Explore every Nigerian higher institution.</h2>
        
      </div>
      <div className="selection-counter"><strong>{initialInstitutions.length}</strong><span>institutions listed</span></div>
    </section>
    <section className="adm-card university-browser">
      <div className="university-toolbar">
        <label className="search-field large">
          <Search /><span className="sr-only">Search institutions</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, state or ownership" />
        </label>
        <span>{visible.length} results</span>
      </div>
      <div className="chip-row" role="group" aria-label="Filter by institution type">
        {TYPE_FILTERS.map((filter) => (
          <button key={filter.label} type="button" onClick={() => setType(filter.value)} className={`chip${type === filter.value ? ' active' : ''}`} aria-pressed={type === filter.value}>{filter.label}</button>
        ))}
      </div>
      {visible.length ? (
        <div className="university-grid">
          {visible.map((institution) => (
            <article className="university-card" key={institution.id}>
              <div className="university-card-top">
                <span className="university-mark">{institution.name.replace(/^The /, '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
                <span className="badge">{TYPE_LABELS[institution.type]}</span>
              </div>
              <h3>{institution.name}</h3>
              <p className="location"><MapPin />{institution.state} · <span className="capitalize">{institution.ownership}</span></p>
              {institution.yearEstablished ? <p className="muted-line">Established {institution.yearEstablished}</p> : null}
              <Link href={`/dashboard/institutions/${institution.id}`}>View courses <ArrowRight /></Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state compact-empty"><Search /><h3>No institutions found</h3></div>
      )}
    </section>
  </>
}
