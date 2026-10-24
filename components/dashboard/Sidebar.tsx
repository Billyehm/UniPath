"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Building2, CircleHelp, FileCheck2, Files, GraduationCap, LayoutDashboard, School, Settings, UserRound, X } from 'lucide-react'
import Logo from '@/components/Logo'

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/documents', label: 'My Documents', icon: Files },
  { href: '/dashboard/requirements', label: 'Requirement', icon: FileCheck2 },
  { href: '/dashboard/my-institutions', label: 'My Institutions', icon: Building2 },
  { href: '/dashboard/institutions', label: 'All Institutions', icon: School },
  { href: '/dashboard/updates', label: 'News', icon: GraduationCap },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
]

function isActive(pathname: string, href: string) {
  return href === '/dashboard' ? pathname === href : pathname.startsWith(href)
}

export default function Sidebar({ open, onClose, name, avatarUrl, unreadNotifications }: { open: boolean; onClose: () => void; name: string; avatarUrl?: string | null; unreadNotifications: number }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])
  return (
    <>
      {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`adm-sidebar ${open ? 'is-open' : ''}`}>
        <div>
          <div className="sidebar-brand-row">
            <Link href="/dashboard" className="adm-brand" onClick={onClose}>
              <Logo variant="dark" className="h-10 w-auto" />
            </Link>
            <button className="sidebar-close" aria-label="Close navigation" onClick={onClose}><X /></button>
          </div>
          <nav className="adm-nav no-scrollbar" aria-label="Student navigation">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={onClose} className={`adm-nav-item ${isActive(pathname, href) ? 'active' : ''}`}>
                <Icon aria-hidden="true" /><span>{label}</span>{href === '/dashboard/notifications' && unreadNotifications > 0 ? <span className="nav-count">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span> : null}
              </Link>
            ))}
          </nav>
        </div>
        <div className="adm-sidebar-bottom">
          <Link className={`adm-nav-item ${isActive(pathname, '/dashboard/support') ? 'active' : ''}`} href="/dashboard/support" onClick={onClose}><CircleHelp /><span>Help & Support</span></Link>
          <Link className={`adm-nav-item ${isActive(pathname, '/dashboard/settings') ? 'active' : ''}`} href="/dashboard/settings" onClick={onClose}><Settings /><span>Settings</span></Link>
          <Link href="/dashboard/profile" onClick={onClose} className={`adm-profile ${isActive(pathname, '/dashboard/profile') ? 'active' : ''}`}>
            <span className="avatar">{avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound />}</span>
            <span className="profile-info"><strong>{name}</strong><small>Student profile</small></span>
          </Link>
        </div>
      </aside>
    </>
  )
}
