'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, Search } from 'lucide-react'
import type { Institution, InstitutionType } from '@/lib/models'
import { typeLabel } from '@/components/dashboard/InstitutionsBrowser'

const TYPE_FILTERS: { value: '' | InstitutionType; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'university', label: 'Universities' },
  { value: 'polytechnic', label: 'Polytechnics' },
  { value: 'college_of_education', label: 'Colleges' },
]

function initials(name: string) {
  return name.replace(/^The /, '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default function AdminInstitutionsBrowser({ initialInstitutions }: { initialInstitutions: Institution[] }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'' | InstitutionType>('')

  const visible = useMemo(() => {
    const q = query.toLowerCase()
    return initialInstitutions.filter((item) => {
      if (type && item.type !== type) return false
      if (!q) return true
      return `${item.name} ${item.state} ${item.ownership}`.toLowerCase().includes(q)
    })
  }, [initialInstitutions, query, type])

  return <>
    <div className="mt-7 flex flex-col gap-4">
      <label className="flex h-11 w-full max-w-xl items-center gap-2 rounded-xl border border-[#dfe3da] bg-white px-3">
        <Search className="size-4 shrink-0 text-[#667069]" /><span className="sr-only">Search institutions</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, state or ownership" className="w-full bg-transparent text-sm outline-none placeholder:text-[#9aa39c]" />
      </label>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by institution type">
        {TYPE_FILTERS.map((filter) => (
          <button key={filter.label} type="button" onClick={() => setType(filter.value)} aria-pressed={type === filter.value}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${type === filter.value ? 'border-[#17351f] bg-[#17351f] text-white' : 'border-[#dfe3da] bg-white text-[#3c443e] hover:border-[#17351f]'}`}>
            {filter.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-[#667069]">{visible.length} of {initialInstitutions.length} institutions</p>
    </div>
    {visible.length ? (
      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((institution) => (
          <article key={institution.id} className="rounded-2xl border border-[#dfe3da] bg-white p-5">
            <div className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-[#17351f] font-black text-[#d8ff63]">{initials(institution.name)}</span>
              <span className="rounded-full bg-[#eef2ea] px-3 py-1 text-xs font-bold text-[#31583b]">{typeLabel(institution.type)}</span>
            </div>
            <h3 className="mt-5 font-bold">{institution.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-[#667069]"><MapPin className="size-3.5" />{institution.state} · <span className="capitalize">{institution.ownership}</span></p>
            {institution.yearEstablished ? <p className="mt-1 text-sm text-[#667069]">Established {institution.yearEstablished}</p> : null}
            <Link href={`/admin/institutions/${institution.id}`} className="mt-5 flex items-center gap-2 text-sm font-bold text-[#31583b]">View courses<ArrowRight className="size-4" /></Link>
          </article>
        ))}
      </section>
    ) : (
      <div className="mt-4 rounded-2xl border border-[#dfe3da] bg-white p-12 text-center">
        <h3 className="font-bold">No institutions found</h3>
        <p className="mt-1 text-sm text-[#667069]">Try a different search term or filter.</p>
      </div>
    )}
  </>
}
