import { Bell, FileCheck2, MessageSquareText } from 'lucide-react'
import Link from 'next/link'
import { getDashboardSummary } from '@/lib/data/admin'

export default async function AdminNotificationsPage() {
  const summary = await getDashboardSummary()
  const notices = [...(summary.pendingReviews > 0 ? [{ title: `${summary.pendingReviews} documents await review`, text: 'Open the document queue to keep applications moving.', icon: FileCheck2, href: '/admin/documents' }] : []), ...(summary.openTickets > 0 ? [{ title: `${summary.openTickets} support tickets are open`, text: 'Prioritize urgent and high-priority conversations.', icon: MessageSquareText, href: '/admin/support/inbox' }] : [])]
  return <div className="mx-auto max-w-5xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Team alerts</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Notifications</h2><section className="mt-7 space-y-3">{notices.map((notice) => { const Icon = notice.icon; return <Link href={notice.href} key={notice.title} className="flex items-start gap-4 rounded-2xl border border-[#dfe3da] bg-white p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eff4ea] text-[#17351f]"><Icon className="size-5" /></span><div><h3 className="font-bold">{notice.title}</h3><p className="mt-1 text-sm text-[#667069]">{notice.text}</p></div></Link> })}{!notices.length && <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#cfd6cc] p-5 text-sm text-[#667069]"><Bell className="size-5" />No operational notifications right now.</div>}</section></div>
}
