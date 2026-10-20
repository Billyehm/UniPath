import ApplicantMessages from '@/components/dashboard/ApplicantMessages'
import { requireUser } from '@/lib/auth'
import { getApplicantTickets } from '@/lib/data/applicant'

export default async function MessagesPage() {
  const user = await requireUser()
  const tickets = await getApplicantTickets(user.id)
  return <div className="space-y-6"><section><p className="eyebrow-dark">Human support</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Your conversations.</h2><p className="mt-2 text-[#667069]">Keep every reply in one thread.</p></section><ApplicantMessages initialTickets={tickets} userId={user.id} /></div>
}
