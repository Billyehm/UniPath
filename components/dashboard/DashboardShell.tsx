'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'

export default function DashboardShell({ children, name, avatarUrl, unreadNotifications }: { children: React.ReactNode; name: string; avatarUrl?: string | null; unreadNotifications: number }) {
  const [navOpen, setNavOpen] = useState(false)
  return <div className="adm-root"><Sidebar open={navOpen} onClose={() => setNavOpen(false)} name={name} avatarUrl={avatarUrl} unreadNotifications={unreadNotifications} /><div className="adm-main"><Topbar onMenu={() => setNavOpen(true)} name={name} unreadNotifications={unreadNotifications} /><main className="adm-content">{children}</main></div></div>
}
