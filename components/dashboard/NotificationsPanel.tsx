'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCheck, FileCheck2, Radio, University } from 'lucide-react'
import type { Json, TableRow } from '@/lib/database.types'

type Channel = { sms: boolean; email: boolean }
type Preferences = Record<string, Channel>
type NotificationItem = Pick<TableRow<'notifications'>, 'id' | 'type' | 'title' | 'body' | 'href' | 'created_at' | 'read_at'>
const defaults: Preferences = { application: { sms: true, email: true }, university: { sms: false, email: true }, deadline: { sms: true, email: true }, action: { sms: true, email: true }, completion: { sms: false, email: true } }
const iconFor = (type: string) => type === 'Action required' ? AlertCircle : type === 'University update' ? University : type === 'Document update' ? FileCheck2 : Radio

export default function NotificationsPanel({ initialItems, initialPreferences }: { initialItems: NotificationItem[]; initialPreferences: Json }) {
  const [items, setItems] = useState(initialItems)
  const [tab, setTab] = useState<'notifications' | 'preferences'>('notifications')
  const [preferences, setPreferences] = useState<Preferences>(() => typeof initialPreferences === 'object' && initialPreferences && !Array.isArray(initialPreferences) ? { ...defaults, ...(initialPreferences as Preferences) } : defaults)
  async function markRead(ids?: string[]) {
    const response = await fetch('/api/notifications/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ids ? { ids } : {}) })
    if (response.ok) setItems((current) => current.map((item) => !ids || ids.includes(item.id) ? { ...item, read_at: item.read_at || new Date().toISOString() } : item))
  }
  async function toggle(category: string, channel: keyof Channel) {
    const next = { ...preferences, [category]: { ...preferences[category], [channel]: !preferences[category][channel] } }
    setPreferences(next)
    await fetch('/api/notifications/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preferences: next }) })
  }
  return <><div className="page-tabs"><button className={tab === 'notifications' ? 'active' : ''} onClick={() => setTab('notifications')}>Notifications <span>{items.filter((item) => !item.read_at).length}</span></button><button className={tab === 'preferences' ? 'active' : ''} onClick={() => setTab('preferences')}>Preferences</button></div>{tab === 'notifications' ? <section className="adm-card"><div className="section-heading"><div><h2>Recent notifications</h2></div><button className="text-button" onClick={() => markRead()}><CheckCheck />Mark all as read</button></div><div className="notification-list">{items.map((item) => { const Icon = iconFor(item.type); return <Link key={item.id} href={item.href} onClick={() => markRead([item.id])} className={`notification-row ${item.read_at ? '' : 'unread'}`}><span className="notification-icon"><Icon /></span><div><span>{item.type}</span><strong>{item.title}</strong><p>{item.body}</p></div><time>{new Date(item.created_at).toLocaleString()}</time>{!item.read_at && <i />}</Link> })}{!items.length && <div className="empty-state compact-empty"><Radio /><h3>No notifications yet</h3></div>}</div></section> : <section className="adm-card preferences-card"><div className="section-heading"><div><h2>Notification preferences</h2><p>Changes are saved directly to your account.</p></div></div>{Object.entries(preferences).map(([category, value]) => <div className="preference-row" key={category}><div><strong className="capitalize">{category.replaceAll('_', ' ')} updates</strong><p>Choose how notifications reach you.</p></div><div className="preference-options"><label>SMS<button className={`switch ${value.sms ? 'on' : ''}`} role="switch" aria-checked={value.sms} onClick={() => toggle(category, 'sms')}><span /></button></label><label>Email<button className={`switch ${value.email ? 'on' : ''}`} role="switch" aria-checked={value.email} onClick={() => toggle(category, 'email')}><span /></button></label></div></div>)}<div className="saved-note"><CheckCheck />Changes save automatically</div></section>}</>
}
