import SupportInbox from '@/components/admin/SupportInbox'
import { getSupportTickets } from '@/lib/data/admin'

export default async function SupportInboxPage() {
  const tickets = await getSupportTickets()
  return <div className="mx-auto max-w-7xl"><div className="mb-6"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Applicant support</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Support inbox</h2><p className="mt-2 text-[#667069]">Prioritize requests and keep ticket status current.</p></div><SupportInbox initialTickets={tickets} /></div>
}
