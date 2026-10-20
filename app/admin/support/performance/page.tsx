import { CheckCircle2, Clock3, MessageSquareText } from 'lucide-react'
import { requireStaff } from '@/lib/auth'
import { getSupportTickets } from '@/lib/data/admin'

export default async function SupportPerformancePage() {
  const user = await requireStaff()
  const tickets = await getSupportTickets(user.id)
  const resolved = tickets.filter((item) => item.status === 'resolved').length
  const cards = [{ label: 'Assigned conversations', value: tickets.length, icon: MessageSquareText }, { label: 'Resolved', value: resolved, icon: CheckCircle2 }, { label: 'Currently waiting', value: tickets.filter((item) => item.status === 'pending').length, icon: Clock3 }]
  return <div className="mx-auto max-w-6xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Personal performance</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Your support activity</h2><section className="mt-7 grid gap-4 md:grid-cols-3">{cards.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-2xl border border-[#dfe3da] bg-white p-6"><Icon className="size-5 text-[#54725d]" /><strong className="mt-6 block text-4xl">{value}</strong><p className="mt-1 text-sm text-[#667069]">{label}</p></article>)}</section></div>
}
