import { BarChart3, FileCheck2, MessageCircle, Users } from 'lucide-react'
import { requireAdmin } from '@/lib/auth'
import { getDashboardSummary, getSupportTickets } from '@/lib/data/admin'

export default async function AnalyticsPage() {
  await requireAdmin()
  const [summary, tickets] = await Promise.all([getDashboardSummary(), getSupportTickets()])
  const resolved = tickets.filter((ticket) => ticket.status === 'resolved').length
  const resolutionRate = tickets.length ? Math.round((resolved / tickets.length) * 100) : 0
  const values = [{ label: 'Applicants', value: summary.applicantUsers, icon: Users }, { label: 'Documents', value: summary.totalDocuments, icon: FileCheck2 }, { label: 'Support tickets', value: tickets.length, icon: MessageCircle }, { label: 'Resolution rate', value: `${resolutionRate}%`, icon: BarChart3 }]
  const max = Math.max(summary.applicantUsers, summary.totalDocuments, tickets.length, 1)
  return <div className="mx-auto max-w-7xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Reporting</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Analytics</h2><section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{values.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-2xl border border-[#dfe3da] bg-white p-5"><Icon className="size-5 text-[#54725d]" /><strong className="mt-6 block text-4xl">{value}</strong><p className="text-sm text-[#667069]">{label}</p></article>)}</section><section className="mt-5 rounded-2xl border border-[#dfe3da] bg-white p-6"><h3 className="font-bold">Workload comparison</h3><p className="text-sm text-[#667069]">Record volumes.</p><div className="mt-7 space-y-5">{[{ label: 'Applicants', value: summary.applicantUsers }, { label: 'Documents', value: summary.totalDocuments }, { label: 'Tickets', value: tickets.length }, { label: 'Pending reviews', value: summary.pendingReviews }].map((item) => <div key={item.label}><div className="mb-2 flex justify-between text-sm"><span>{item.label}</span><strong>{item.value}</strong></div><div className="h-3 overflow-hidden rounded-full bg-[#edf0e9]"><span className="block h-full rounded-full bg-[#54725d]" style={{ width: `${Math.max((item.value / max) * 100, item.value ? 5 : 0)}%` }} /></div></div>)}</div></section></div>
}
