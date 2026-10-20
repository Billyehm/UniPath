import Link from 'next/link'
import { ArrowLeft, Building2, CalendarDays, Globe, Info, MapPin } from 'lucide-react'
import InstitutionCourses from '@/components/dashboard/InstitutionCourses'
import { typeLabel } from '@/components/dashboard/InstitutionsBrowser'
import { requireUser } from '@/lib/auth'
import { getInstitution } from '@/lib/data/application'

export default async function InstitutionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const { id } = await params
  if (!/^[a-z0-9-]{1,80}$/.test(id)) {
    return <div className="adm-card empty-state"><h2>Institution not found</h2><Link href="/dashboard/institutions" className="adm-button button-primary">Browse institutions</Link></div>
  }
  const result = await getInstitution(id)
  if (!result) {
    return <div className="adm-card empty-state"><h2>Institution not found</h2><Link href="/dashboard/institutions" className="adm-button button-primary">Browse institutions</Link></div>
  }
  const { institution, courseCount } = result
  return <div className="page-stack narrow-page">
    <Link className="back-link" href="/dashboard/institutions"><ArrowLeft />Back to institutions</Link>
    <section className="university-hero">
      <div>
        <span className="university-mark large-mark">{institution.name.replace(/^The /, '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
        <p>{typeLabel(institution.type)} · <span className="capitalize">{institution.ownership}</span></p>
        <h2>{institution.name}</h2>
        <span className="location"><MapPin />{institution.state}</span>
      </div>
    </section>
    <div className="detail-content-grid">
      <section className="adm-card">
        <h2>About this institution</h2>
        <div className="info-block"><span>Institution type</span><strong>{typeLabel(institution.type)}</strong></div>
        <div className="info-block"><span>Ownership</span><strong className="capitalize">{institution.ownership}</strong></div>
        <div className="info-block"><span>Location</span><strong>{institution.state}</strong></div>
        <div className="info-block"><span>Year established</span><strong>{institution.yearEstablished ?? 'Not recorded'}</strong></div>
        {institution.website ? <div className="info-block"><span>Website</span><strong><a className="inline-link" href={institution.website} target="_blank" rel="noreferrer"><Globe />{institution.website.replace(/^https?:\/\//, '')}</a></strong></div> : null}
      </section>
      <aside className="adm-card subscription-card">
        <span className="subscription-icon"><Building2 /></span>
        <h3>{courseCount} courses listed</h3>
        <p>Search below to find a course and see its qualification and typical duration.</p>
      </aside>
    </div>
    <InstitutionCourses institutionId={institution.id} total={courseCount} />
    <p className="disclaimer-note"><Info />Course lists are indicative and follow standard Nigerian qualification patterns. Confirm details with the institution before applying.</p>
  </div>
}
