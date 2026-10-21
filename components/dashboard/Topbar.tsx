"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, Search } from 'lucide-react'

const titles: Record<string, string> = {
  '/dashboard': 'Overview', '/dashboard/requirements': 'Requirement', '/dashboard/documents': 'My Documents',
  '/dashboard/my-institutions': 'My Institutions', '/dashboard/updates': 'University Updates', '/dashboard/messages': 'Support Messages',
  '/dashboard/notifications': 'Notifications', '/dashboard/profile': 'Student Profile', '/dashboard/settings': 'Settings', '/dashboard/support': 'Help & Support', '/dashboard/payment': 'Application Payment',
}

export default function Topbar({ onMenu, name, unreadNotifications }: { onMenu: () => void; name: string; unreadNotifications: number }) {
  const pathname = usePathname()
  const title = titles[pathname] ?? (pathname.startsWith('/dashboard/documents/') ? 'Document Upload' : pathname.startsWith('/dashboard/requirements/') ? 'Requirement Details' : pathname.startsWith('/dashboard/institutions/') ? 'Institution Details' : 'UniPath')
  return (
    <header className="adm-topbar">
      <div className="topbar-heading">
        <button className="mobile-menu" aria-label="Open navigation" onClick={onMenu}><Menu /></button>
        <div><p className="topbar-kicker">Student application</p><h1>{title}</h1></div>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn topbar-search" aria-label="Search"><Search /></button>
        <Link className="icon-btn notification-button" aria-label={unreadNotifications ? `Notifications, ${unreadNotifications} unread` : 'Notifications'} href="/dashboard/notifications"><Bell />{unreadNotifications > 0 && <span>{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>}</Link>
        <Link href="/dashboard/profile" className="topbar-user"><span className="avatar avatar-small">{name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span><strong>{name.split(' ')[0]}</strong><small>Student</small></span></Link>
      </div>
    </header>
  )
}
