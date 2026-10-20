import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock3, Inbox, MessageSquareText } from 'lucide-react'
import { requireStaff } from '@/lib/auth'
import { getSupportTickets } from '@/lib/data/admin'

export default async function SupportOverviewPage() {
  const user = await requireStaff()
  const [tickets, assigned] = await Promise.all([getSupportTickets(), getSupportTickets(user.id)])
  const metrics = [
    { label: 'Open tickets', value: tickets.filter((item) => item.status === 'open').length, icon: Inbox },
    { label: 'Assigned to you', value: assigned.filter((item) => item.status !== 'resolved').length, icon: MessageSquareText },
    { label: 'Waiting', value: tickets.filter((item) => item.status === 'pending').length, icon: Clock3 },
    { label: 'Resolved', value: tickets.filter((item) => item.status === 'resolved').length, icon: CheckCircle2 },
  ]
  return <div className="mx-auto max-w-7xl space-y-6"><section><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Support overview</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Good to see you, {user.displayName.split(' ')[0]}.</h2></section><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-2xl border border-[#dfe3da] bg-white p-5"><Icon className="size-5 text-[#54725d]" /><strong className="mt-5 block text-3xl">{value}</strong><p className="text-sm text-[#667069]">{label}</p></article>)}</section><section className="grid gap-5 xl:grid-cols-[1.4fr_.6fr]"><article className="rounded-2xl border border-[#dfe3da] bg-white p-5"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold">Recent tickets</h3></div><Link href="/admin/support/inbox" className="flex items-center gap-1 text-sm font-bold text-[#31583b]">Open inbox <ArrowRight className="size-4" /></Link></div><div className="mt-4 divide-y divide-[#edf0e9]">{tickets.slice(0, 6).map((ticket) => <Link href="/admin/support/inbox" key={ticket.id} className="flex items-center justify-between gap-4 py-4"><div><strong className="text-sm">{ticket.subject}</strong><p className="text-sm text-[#667069]">{ticket.applicantName}</p></div><span className="rounded-full bg-[#eff4ea] px-2.5 py-1 text-xs font-bold capitalize">{ticket.status}</span></Link>)}</div></article><aside className="rounded-2xl bg-[#17351f] p-6 text-white"><p className="text-xs font-bold uppercase tracking-widest text-[#d8ff63]">Response target</p><strong className="mt-6 block text-5xl">30m</strong><p className="mt-3 text-sm leading-6 text-white/60">Keep urgent and high-priority conversations moving first.</p><Link href="/admin/support/assigned" className="mt-8 flex items-center gap-2 text-sm font-bold text-[#d8ff63]">View my queue <ArrowRight className="size-4" /></Link></aside></section></div>
}
