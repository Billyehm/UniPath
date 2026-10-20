import '../../styles/unipath.css'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { requireUser } from '@/lib/auth'
import { getUnreadNotificationCount } from '@/lib/data/application'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  if (user.role === 'admin') redirect('/admin')
  if (user.role === 'support_agent') redirect('/admin/support')
  const unreadNotifications = await getUnreadNotificationCount(user.id)
  return <DashboardShell name={user.displayName} unreadNotifications={unreadNotifications}>{children}</DashboardShell>
}
