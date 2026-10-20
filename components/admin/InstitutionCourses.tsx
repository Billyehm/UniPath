'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Clock, Search } from 'lucide-react'
import type { InstitutionCourse } from '@/lib/models'

function useDebounced(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function AdminInstitutionCourses({ institutionId, total }: { institutionId: string; total: number }) {
  const [query, setQuery] = useState('')
  const [courses, setCourses] = useState<InstitutionCourse[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultTotal, setResultTotal] = useState(total)
  const debouncedQuery = useDebounced(query)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/institutions/${institutionId}/courses?q=${encodeURIComponent(debouncedQuery)}&limit=200`)
      .then(async (response) => {
        const result = await response.json()
        if (cancelled) return
        if (response.ok) {
          setCourses(result.courses)
          setResultTotal(result.total)
        }
        setLoaded(true)
        setLoading(false)
      })
      .catch(() => { if (!cancelled) { setLoaded(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [institutionId, debouncedQuery])

  return <section className="mt-6 rounded-2xl border border-[#dfe3da] bg-white p-5 md:p-7">
    <h2 className="text-xl font-bold">Courses</h2>
    <p className="mt-1 text-sm text-[#667069]">Search the courses offered at this institution.</p>
    <label className="mt-4 flex h-11 w-full max-w-xl items-center gap-2 rounded-xl border border-[#dfe3da] bg-white px-3">
      <Search className="size-4 shrink-0 text-[#667069]" /><span className="sr-only">Search courses</span>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, e.g. Computer Science" className="w-full bg-transparent text-sm outline-none placeholder:text-[#9aa39c]" />
    </label>
    <p className="mt-3 text-sm text-[#667069]">{loading ? 'Searching…' : `${resultTotal} course${resultTotal === 1 ? '' : 's'}`}</p>
    {loaded && !courses.length ? (
      <div className="mt-4 rounded-xl bg-[#f4f6f1] p-10 text-center">
        <h3 className="font-bold">No courses found</h3>
        <p className="mt-1 text-sm text-[#667069]">{query ? 'Try a different search term.' : 'Course data for this institution is not available yet.'}</p>
      </div>
    ) : (
      <ul className="mt-4 flex flex-col gap-2">
        {courses.map((course) => (
          <li key={course.id} className="flex items-center gap-3 rounded-xl border border-[#e7ebe3] px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eef2ea] text-[#31583b]"><BookOpen className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{course.qualification} {course.courseName}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#667069]">
                {course.durationYears ? <><Clock className="size-3" />{course.durationYears} years</> : null}
                {course.durationYears && course.faculty ? <span> · </span> : null}
                {course.faculty ? <span className="truncate">{course.faculty}</span> : null}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[#eef2ea] px-3 py-1 text-xs font-bold text-[#31583b]">{course.qualification}</span>
          </li>
        ))}
      </ul>
    )}
  </section>
}
