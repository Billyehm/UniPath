import Link from 'next/link'
import { ArrowRight, CircleAlert, Clock3, FileCheck2, MessageCircle } from 'lucide-react'
import ProgressCard from '@/components/dashboard/ProgressCard'
import RequirementsList from '@/components/dashboard/RequirementsList'
import NextActionsCarousel from '@/components/dashboard/NextActionsCarousel'
import { requireUser } from '@/lib/auth'
import { getApplicantDocuments, getApplicantTickets } from '@/lib/data/applicant'
import SharedStatusBadge from '@/components/shared/StatusBadge'
import { getActiveSystemNotice, getRequirements, getDirectoryUniversities } from '@/lib/data/application'

export default async function DashboardPage() {
  const user = await requireUser()
  const [documents, tickets, requirements, universities, systemNotice] = await Promise.all([getApplicantDocuments(user.id), getApplicantTickets(user.id), getRequirements(user.id), getDirectoryUniversities(user.id), getActiveSystemNotice()])
  const completed = requirements.filter((item) => item.status === 'completed').length
  const nextActions = requirements.filter((item) => item.status === 'action_needed' || item.status === 'not_started')
  const percent = requirements.length ? Math.round((completed / requirements.length) * 100) : 0
  return (
    <div className="page-stack">
      <section className="page-intro"><div><p className="eyebrow-dark">Your application workspace</p><h2>Welcome back, {user.displayName.split(' ')[0]}.</h2></div><Link className="adm-button button-primary" href="/dashboard/requirements">Continue application <ArrowRight /></Link></section>

      <div className="dashboard-hero-grid">
        <ProgressCard percent={percent} completed={completed} total={requirements.length} remaining={requirements.length - completed} />
        <NextActionsCarousel actions={nextActions} />
      </div>

      <div className="metric-grid">
        <Link className="metric-card" href="/dashboard/documents"><span className="metric-icon"><FileCheck2 /></span><span><strong>{documents.filter((item) => item.review_status === 'approved').length}/{documents.length}</strong><small>Documents approved</small></span></Link>
        <Link className="metric-card" href="/dashboard/documents"><span className="metric-icon warning"><CircleAlert /></span><span><strong>{documents.filter((item) => item.review_status === 'resubmission_requested' || item.review_status === 'rejected').length}</strong><small>Documents need action</small></span></Link>
        <Link className="metric-card" href="/dashboard/messages"><span className="metric-icon"><MessageCircle /></span><span><strong>{tickets.filter((item) => item.status !== 'resolved').length}</strong><small>Open support tickets</small></span></Link>
      </div>

      <div className="dashboard-content-grid">
        <section className="adm-card"><div className="section-heading"><div><h2>Application requirements</h2></div><Link href="/dashboard/requirements">View all <ArrowRight /></Link></div><RequirementsList items={requirements.slice(0, 4)} compact /></section>
        <aside className="side-stack">
          <section className="adm-card system-card"><div className="system-heading"><span className="system-pulse" /><div><span className="card-eyebrow">External system status</span><h2>{systemNotice?.title || 'No active notice'}</h2></div></div><p>{systemNotice?.body || 'All monitored systems are operating normally.'}</p></section>
          <section className="adm-card selected-card"><div className="section-heading"><div><h2>Your universities</h2><p>{universities.filter((u) => u.selected).length} of 3 selected</p></div><Link href="/dashboard/universities">Manage</Link></div>{universities.filter((u) => u.selected).map((u) => <Link className="mini-university" href={`/dashboard/institutions/${u.id}`} key={u.id}><span>{u.shortName}</span><div><strong>{u.name}</strong><small>{u.location}</small></div><ArrowRight /></Link>)}</section>
        </aside>
      </div>

      <section className="adm-card"><div className="section-heading"><div><h2>Recent document activity</h2><p>Latest submissions.</p></div></div><div className="activity-list">{documents.slice(0, 5).map((item) => <div className="activity-row" key={item.id}><span className="activity-dot" /><div><strong>{item.document_type}</strong><p>{item.original_name}</p></div><SharedStatusBadge value={item.review_status} /><time>{new Date(item.updated_at).toLocaleDateString()}</time></div>)}{!documents.length && <p className="py-8 text-center text-sm text-[#667069]">Upload a document to begin.</p>}</div></section>
    </div>
  )
}
