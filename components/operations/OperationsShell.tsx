"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardCheck, FileClock, GraduationCap, LayoutDashboard, LogOut, MessagesSquare, ScrollText, Users } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Founder overview', icon: LayoutDashboard },
  { href: '/operations/support', label: 'Support review', icon: ClipboardCheck },
  { href: '/operations/liaison', label: 'Liaison processing', icon: FileClock },
  { href: '/admin/access-logs', label: 'Access logs', icon: ScrollText },
]

export default function OperationsShell({ children, role }: { children: React.ReactNode; role: string }) {
  const pathname = usePathname()
  return <div className="ops-root"><aside className="ops-sidebar"><Link href="/admin" className="ops-brand"><span><GraduationCap /></span><div><strong>UniPath</strong><small>Internal operations</small></div></Link><nav>{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname === href ? 'active' : ''}><Icon /><span>{label}</span></Link>)}</nav><div className="ops-account"><span>IN</span><div><strong>Ifeoma N.</strong><small>{role}</small></div><LogOut /></div></aside><main className="ops-main"><header><div><p>UniPath operations</p><h1>{role}</h1></div><Link href="/dashboard">Student app</Link></header><div className="ops-content">{children}</div></main></div>
}
