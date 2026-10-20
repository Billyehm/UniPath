import type { Institution, InstitutionCourse } from '@/lib/models'
import dataset from '@/data/institutions.json'

/**
 * Institutions directory data source.
 *
 * Default: the bundled data/institutions.json. The directory therefore adds
 * zero weight to the database — no tables, no seed to run.
 *
 * Optional override: set INSTITUTIONS_API_URL (and INSTITUTIONS_API_KEY) to
 * serve the directory from an external keyed API instead. Expected contract:
 *   GET {INSTITUTIONS_API_URL}/institutions
 *     -> { institutions: [{ id, name, type, ownership, state, yearEstablished, website }] }
 *   GET {INSTITUTIONS_API_URL}/institutions/{id}/courses
 *     -> { courses: [{ courseName, qualification, durationYears, faculty, source }] }
 * The key is sent as `Authorization: Bearer <INSTITUTIONS_API_KEY>`.
 * Regenerate the bundled file with: python3 scripts/build-institutions-dataset.py
 */

type RawInstitution = {
  id: string
  name: string
  type: string
  ownership: string
  state: string
  yearEstablished: number | null
  website: string | null
}

type RawCourse = {
  institutionId: string
  courseName: string
  qualification: string
  durationYears: number | null
  faculty: string | null
  source: string
}

const raw = dataset as { institutions: RawInstitution[]; courses: RawCourse[] }

const localInstitutions: Institution[] = raw.institutions.map((item) => ({
  id: item.id,
  name: item.name,
  type: item.type as Institution['type'],
  ownership: item.ownership as Institution['ownership'],
  state: item.state,
  yearEstablished: item.yearEstablished,
  website: item.website,
}))

const localCoursesByInstitution = new Map<string, InstitutionCourse[]>()
for (const item of raw.courses) {
  const list = localCoursesByInstitution.get(item.institutionId) ?? []
  list.push({
    id: `${item.institutionId}:${list.length}`,
    courseName: item.courseName,
    qualification: item.qualification,
    durationYears: item.durationYears,
    faculty: item.faculty,
    source: item.source as InstitutionCourse['source'],
  })
  localCoursesByInstitution.set(item.institutionId, list)
}
for (const list of localCoursesByInstitution.values()) {
  list.sort((a, b) => a.courseName.localeCompare(b.courseName))
  list.forEach((course, index) => { course.id = `${course.id.split(':')[0]}:${index}` })
}

function externalBase() {
  return (process.env.INSTITUTIONS_API_URL || '').replace(/\/$/, '')
}

function externalHeaders(): HeadersInit {
  const key = process.env.INSTITUTIONS_API_KEY
  return key ? { Authorization: `Bearer ${key}` } : {}
}

async function externalGet<T>(path: string): Promise<T | null> {
  const base = externalBase()
  if (!base) return null
  const response = await fetch(`${base}${path}`, { headers: externalHeaders(), cache: 'force-cache' })
  if (!response.ok) throw new Error(`Institutions API request failed (${response.status})`)
  return (await response.json()) as T
}

export type InstitutionFilters = { q?: string; type?: string; state?: string; limit?: number; offset?: number }

export async function listInstitutions(filters: InstitutionFilters): Promise<{ institutions: Institution[]; total: number }> {
  const external = await externalGet<{ institutions: Institution[] }>('/institutions')
  const all = external?.institutions ?? localInstitutions
  const q = (filters.q ?? '').toLowerCase()
  const filtered = all.filter((item) => {
    if (filters.type && item.type !== filters.type) return false
    if (filters.state && !item.state.toLowerCase().includes(filters.state.toLowerCase())) return false
    if (q && !`${item.name} ${item.state} ${item.ownership}`.toLowerCase().includes(q)) return false
    return true
  })
  const limit = filters.limit ?? 48
  const offset = filters.offset ?? 0
  return { institutions: filtered.slice(offset, offset + limit), total: filtered.length }
}

export async function getInstitutionDetail(id: string): Promise<{ institution: Institution; courseCount: number } | null> {
  const external = await externalGet<{ institution: Institution; courseCount?: number }>(`/institutions/${id}`)
  if (external?.institution) {
    const courses = await externalGet<{ courses: InstitutionCourse[] }>(`/institutions/${id}/courses`)
    return { institution: external.institution, courseCount: courses?.courses.length ?? external.courseCount ?? 0 }
  }
  const institution = localInstitutions.find((item) => item.id === id) ?? null
  if (!institution) return null
  return { institution, courseCount: localCoursesByInstitution.get(id)?.length ?? 0 }
}

export async function listCourses(
  institutionId: string,
  filters: { q?: string; limit?: number; offset?: number },
): Promise<{ courses: InstitutionCourse[]; total: number }> {
  const external = await externalGet<{ courses: InstitutionCourse[] }>(`/institutions/${institutionId}/courses`)
  let courses = external?.courses ?? localCoursesByInstitution.get(institutionId) ?? []
  const q = (filters.q ?? '').toLowerCase()
  if (q) courses = courses.filter((course) => course.courseName.toLowerCase().includes(q))
  const limit = filters.limit ?? 100
  const offset = filters.offset ?? 0
  return { courses: courses.slice(offset, offset + limit), total: courses.length }
}

export function isExternalSource() {
  return Boolean(externalBase())
}
