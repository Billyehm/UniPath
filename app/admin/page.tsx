import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Clock3, FileCheck2, FileText, MessageCircle, Users } from 'lucide-react'
import { getDashboardSummary, getRecentActivity } from '@/lib/data/admin'
import { requireStaff } from '@/lib/auth'

export default async function AdminPage() {
  const user = await requireStaff()
  if (user.role === 'support_agent') redirect('/admin/support')
  const [summary, activity] = await Promise.all([getDashboardSummary(), getRecentActivity()])
  const metrics = [
    { label: 'Total users', value: summary.totalUsers, icon: Users, detail: `${summary.applicantUsers} applicants · ${summary.adminUsers} admins · ${summary.supportUsers} support` },
    { label: 'Total documents', value: summary.totalDocuments, icon: FileText, detail: null },
    { label: 'Pending reviews', value: summary.pendingReviews, icon: FileCheck2, detail: null },
    { label: 'Open support tickets', value: summary.openTickets, icon: MessageCircle, detail: null },
  ]
  return <div className="mx-auto max-w-7xl space-y-6"><section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Operations overview</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Everything requiring attention.</h2><p className="mt-3 max-w-2xl text-[#667069]">Live counts across operations.</p></div></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon, detail }) => <article key={label} className="rounded-3xl border border-[#dfe3da] bg-white p-5"><span className="grid size-11 place-items-center rounded-xl bg-[#eff4ea] text-[#17351f]"><Icon className="size-5" /></span><strong className="mt-6 block text-4xl tracking-tight">{value}</strong><p className="mt-1 text-sm text-[#667069]">{label}</p>{detail && <p className="mt-1 text-xs text-[#7c857f]">{detail}</p>}</article>)}</section>
    <section className="grid gap-5 xl:grid-cols-[1.5fr_.7fr]"><article className="rounded-3xl border border-[#dfe3da] bg-white p-6"><div className="flex items-center justify-between"><div><h3 className="text-xl font-bold">Recent activity</h3><p className="text-sm text-[#667069]">Latest audit events.</p></div><Clock3 className="size-5 text-[#64806b]" /></div><div className="mt-5 divide-y divide-[#e5e8e1]">{activity.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 py-4"><div><strong className="text-sm">{item.action.replaceAll('.', ' ')}</strong><p className="mt-1 text-sm text-[#667069]">{item.actorName} · {item.entityType}</p></div><time className="shrink-0 text-xs text-[#7c857f]">{new Date(item.createdAt).toLocaleString()}</time></div>)}</div></article>
      <aside className="space-y-4"><Link href="/admin/documents" className="block rounded-3xl bg-[#17351f] p-6 text-white"><FileCheck2 className="size-6 text-[#d8ff63]" /><h3 className="mt-8 text-xl font-bold">Review documents</h3><p className="mt-2 text-sm leading-6 text-white/65">Approve, reject, or request resubmission.</p><span className="mt-6 flex items-center gap-2 text-sm font-bold text-[#d8ff63]">Open queue <ArrowRight className="size-4" /></span></Link><Link href="/admin/support" className="block rounded-3xl bg-[#d8ff63] p-6 text-[#17351f]"><MessageCircle className="size-6" /><h3 className="mt-8 text-xl font-bold">Support inbox</h3><p className="mt-2 text-sm leading-6 text-[#425246]">Respond to applicants.</p><span className="mt-6 flex items-center gap-2 text-sm font-bold">Open inbox <ArrowRight className="size-4" /></span></Link></aside>
    </section>
  </div>
}
