import '../../styles/unipath.css'
import AdminShell from '@/components/admin/AdminShell'
import SessionWatchdog from '@/components/SessionWatchdog'
import { requireStaff } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff()
  return <><SessionWatchdog /><AdminShell name={user.displayName} role={user.role}>{children}</AdminShell></>
}
