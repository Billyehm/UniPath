import Link from 'next/link'
import { ArrowLeft, MessageSquareText } from 'lucide-react'
import StaffGroupChat from '@/components/admin/StaffGroupChat'
import { requireStaff } from '@/lib/auth'
import { getStaffChatMessages } from '@/lib/data/admin'

export default async function StaffChatPage() {
  const user = await requireStaff()
  const messages = await getStaffChatMessages()
  return <div className="mx-auto max-w-5xl"><Link href="/admin/help" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#31583b]"><ArrowLeft className="size-4" />Back to Help & Support</Link><div className="mb-6 flex items-start gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-[#eff4ea] text-[#17351f]"><MessageSquareText className="size-6" /></span><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Team space</p><h2 className="mt-1 text-3xl font-semibold tracking-[-.04em]">Ask another team member</h2><p className="mt-2 text-sm leading-6 text-[#667069]">Messages can’t be deleted in the app; edits keep their history.</p></div></div><StaffGroupChat initialMessages={messages} currentUserId={user.id} /></div>
}
