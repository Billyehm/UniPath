import NotificationsPanel from '@/components/dashboard/NotificationsPanel'
import { requireUser } from '@/lib/auth'
import { getNotifications } from '@/lib/data/application'

export default async function NotificationsPage() {
  const user = await requireUser()
  const data = await getNotifications(user.id)
  return <div className="page-stack"><section className="page-intro"><div><p className="eyebrow-dark">Stay informed</p><h2>Notifications and preferences.</h2><p>Choose how UniPath contacts you.</p></div></section><NotificationsPanel initialItems={data.notifications} initialPreferences={data.preferences} /></div>
}
