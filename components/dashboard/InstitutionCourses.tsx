'use client'

import { useEffect, useMemo, useState } from 'react'
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

export default function InstitutionCourses({ institutionId, total }: { institutionId: string; total: number }) {
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

  const groups = useMemo(() => {
    const map = new Map<string, InstitutionCourse[]>()
    for (const course of courses) {
      const key = course.faculty || 'General'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(course)
    }
    return [...map.entries()]
  }, [courses])

  return <section className="adm-card">
    <div className="section-heading">
      <div>
        <h2>Courses</h2>
        
      </div>
    </div>
    <label className="search-field large course-search">
      <Search /><span className="sr-only">Search courses</span>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses, e.g. Computer Science" />
    </label>
    <p className="result-count">{loading ? 'Searching…' : `${resultTotal} course${resultTotal === 1 ? '' : 's'}`}</p>
    {loaded && !courses.length ? (
      <div className="empty-state compact-empty"><BookOpen /><h3>No courses found</h3><p>{query ? 'Try a different search term.' : 'Course data for this institution is not available yet.'}</p></div>
    ) : (
      <div className="course-groups">
        {groups.map(([faculty, items]) => (
          <div key={faculty}>
            <h3 className="course-group-heading">{faculty}</h3>
            <ul className="course-list">
              {items.map((course) => (
                <li className="course-row" key={course.id}>
                  <span className="course-icon"><BookOpen /></span>
                  <div className="course-main">
                    <strong>{course.qualification} {course.courseName}</strong>
                    {course.durationYears ? <span className="course-meta"><Clock />{course.durationYears} years</span> : null}
                  </div>
                  <span className="badge">{course.qualification}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}
  </section>
}
