'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Activity, BarChart3, Bell, BookOpen, Building2, ChevronLeft, ChevronRight, CircleHelp, FileCheck2, GraduationCap, Inbox, LayoutDashboard, LifeBuoy, ListChecks, LogOut, MessageSquareText, School, Settings, Users, UserRoundCog, X } from 'lucide-react'
import type { AppRole } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'

type NavigationItem = { href: string; label: string; icon: typeof LayoutDashboard }
type NavigationGroup = { label?: string; items: NavigationItem[] }

const adminGroups: NavigationGroup[] = [
  { items: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/institutions', label: 'Institutions', icon: School },
    { href: '/admin/requirements', label: 'Requirements', icon: ListChecks },
    { href: '/admin/documents', label: 'Documents', icon: FileCheck2 },
    { href: '/admin/universities', label: 'Universities', icon: Building2 },
    { href: '/admin/updates', label: 'Updates', icon: BookOpen },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  ] },
  { label: 'Insights', items: [
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/system-status', label: 'System Status', icon: Activity },
  ] },
  { label: 'Administration', items: [
    { href: '/admin/staff', label: 'Staff', icon: UserRoundCog },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/help', label: 'Help & Support', icon: CircleHelp },
  ] },
]

const supportGroups: NavigationGroup[] = [
  { items: [
    { href: '/admin/support', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/support/inbox', label: 'Support Inbox', icon: Inbox },
    { href: '/admin/support/assigned', label: 'Assigned Tickets', icon: MessageSquareText },
    { href: '/admin/students', label: 'Applicants', icon: Users },
    { href: '/admin/documents', label: 'Document Reviews', icon: FileCheck2 },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  ] },
  { label: 'Support tools', items: [
    { href: '/admin/support/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { href: '/admin/support/performance', label: 'My Performance', icon: BarChart3 },
  ] },
  { label: 'Account', items: [
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/help', label: 'Help & Support', icon: LifeBuoy },
  ] },
]

function isActive(pathname: string, href: string) {
  return href === '/admin' || href === '/admin/support' ? pathname === href : pathname.startsWith(href)
}

export default function AdminSidebar({ name, role, collapsed, mobileOpen, onToggle, onMobileClose }: { name: string; role: AppRole; collapsed: boolean; mobileOpen: boolean; onToggle: () => void; onMobileClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const groups = role === 'admin' ? adminGroups : supportGroups

  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [mobileOpen])

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/auth')
    router.refresh()
  }

  return <><button aria-label="Close navigation" onClick={onMobileClose} className={`fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden ${mobileOpen ? 'block' : 'hidden'}`} />
    <aside className={`mobile-drawer-lock fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col bg-[#17351f] text-white shadow-2xl transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 lg:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'w-20' : 'w-72'}`}>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5"><Link href={role === 'admin' ? '/admin' : '/admin/support'} onClick={onMobileClose} className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#d8ff63] text-[#17351f]"><GraduationCap className="size-5" /></span>{!collapsed && <span className="text-xl font-bold tracking-tight">UNIPATH<small className="block text-[11px] font-medium normal-case tracking-normal text-white/50">{role === 'admin' ? 'Administration' : 'Support workspace'}</small></span>}</Link><button onClick={onMobileClose} className="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10 lg:hidden"><X className="size-5" /></button></div>
      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label={role === 'admin' ? 'Admin navigation' : 'Support navigation'}>{groups.map((group, index) => <div key={group.label ?? index} className={index ? 'mt-5 border-t border-white/10 pt-5' : ''}>{group.label && !collapsed && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/35">{group.label}</p>}<div className="space-y-1">{group.items.map(({ href, label, icon: Icon }) => { const active = isActive(pathname, href); return <Link title={collapsed ? label : undefined} key={href} href={href} onClick={onMobileClose} className={`group flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition ${collapsed ? 'justify-center' : 'gap-3'} ${active ? 'bg-[#d8ff63] text-[#17351f]' : 'text-white/62 hover:bg-white/[.08] hover:text-white'}`}><Icon className="size-[18px] shrink-0" />{!collapsed && <span>{label}</span>}</Link> })}</div></div>)}</nav>
      <div className="border-t border-white/10 p-3"><div className={`flex items-center rounded-xl bg-white/[.06] p-2 ${collapsed ? 'justify-center' : 'gap-3'}`}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#d8ff63] text-xs font-black text-[#17351f]">{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>{!collapsed && <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{name}</p><p className="truncate text-xs capitalize text-white/45">{role.replace('_', ' ')}</p></div>}{!collapsed && <button onClick={signOut} title="Sign out" className="grid size-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"><LogOut className="size-4" /></button>}</div><button onClick={onToggle} className="mt-2 hidden min-h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold text-white/45 hover:bg-white/[.06] hover:text-white lg:flex">{collapsed ? <ChevronRight className="size-4" /> : <><ChevronLeft className="size-4" />Collapse</>}</button>{collapsed && <button onClick={signOut} title="Sign out" className="mt-2 hidden min-h-9 w-full place-items-center rounded-lg text-white/45 hover:bg-white/[.06] hover:text-white lg:grid"><LogOut className="size-4" /></button>}</div>
    </aside></>
}
