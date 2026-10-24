'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Send } from 'lucide-react'
import Link from 'next/link'
import type { SupportTicket } from '@/lib/models'
import type { TicketStatus } from '@/lib/database.types'
import SupportTicketCard from '@/components/admin/SupportTicketCard'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatDateTime } from '@/lib/format'

const filters: Array<'all' | TicketStatus> = ['all', 'open', 'pending', 'resolved']

export default function SupportInbox({ initialTickets }: { initialTickets: SupportTicket[] }) {
  const [tickets, setTickets] = useState(initialTickets)
  const [filter, setFilter] = useState<'all' | TicketStatus>('all')
  const [selectedId, setSelectedId] = useState(initialTickets[0]?.id ?? '')
  const [message, setMessage] = useState('')
  const [nextStatus, setNextStatus] = useState<TicketStatus>('pending')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const visible = useMemo(() => tickets.filter((ticket) => filter === 'all' || ticket.status === filter), [tickets, filter])
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? visible[0]

  async function reply(event: FormEvent) {
    event.preventDefault()
    if (!selected || !message.trim()) return
    setSending(true); setError('')
    const response = await fetch(`/api/support/tickets/${selected.id}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, status: nextStatus, internal: false }),
    })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Unable to send reply'); setSending(false); return }
    const now = new Date().toISOString()
    setTickets((items) => items.map((ticket) => ticket.id === selected.id ? {
      ...ticket, status: nextStatus, updatedAt: now,
      messages: [...ticket.messages, { id: result.id, body: message, senderUserId: 'current-admin', senderName: 'You', isStaff: true, isInternal: false, createdAt: now }],
    } : ticket))
    setMessage(''); setSending(false)
  }

  return <div className="grid min-h-[650px] gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
    <section className="rounded-3xl border border-[#dfe3da] bg-white p-4">
      <div className="mb-4 flex flex-wrap gap-2">{filters.map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-3 py-2 text-xs font-bold capitalize ${filter === value ? 'bg-[#17351f] text-white' : 'bg-[#eff4ea] text-[#526157]'}`}>{value}</button>)}</div>
      <div className="space-y-3">{visible.map((ticket) => <SupportTicketCard key={ticket.id} ticket={ticket} active={selected?.id === ticket.id} onSelect={() => setSelectedId(ticket.id)} />)}{!visible.length && <p className="py-12 text-center text-sm text-[#667069]">No {filter === 'all' ? '' : filter} tickets.</p>}</div>
    </section>
    <section className="flex min-w-0 flex-col rounded-3xl border border-[#dfe3da] bg-white">
      {selected ? <><header className="border-b border-[#dfe3da] p-6"><div className="flex flex-wrap items-center gap-2"><StatusBadge value={selected.status} /><StatusBadge value={selected.priority} /></div><h2 className="mt-3 text-2xl font-bold tracking-tight">{selected.subject}</h2><div className="mt-2 flex items-center gap-2">{selected.applicantAvatarUrl ? <img src={selected.applicantAvatarUrl} alt="" className="size-8 rounded-full object-cover" /> : null}<Link href={`/admin/students/${selected.applicantId}`} className="text-sm text-[#667069] underline-offset-2 hover:text-[#31583b] hover:underline">{selected.applicantName} · {selected.applicantEmail}</Link></div></header>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[#fafbf8] p-6">{selected.messages.map((item) => <article key={item.id} className={`max-w-[78%] rounded-2xl px-4 py-3 ${item.isStaff ? 'ml-auto bg-[#17351f] text-white' : 'bg-white ring-1 ring-[#dfe3da]'}`}><div className="mb-1 flex items-center gap-2 text-xs opacity-65"><strong>{item.senderName}</strong><time>{formatDateTime(item.createdAt)}</time></div><p className="whitespace-pre-wrap text-sm leading-6">{item.body}</p></article>)}</div>
        <form onSubmit={reply} className="border-t border-[#dfe3da] p-5"><div className="flex flex-col gap-3 sm:flex-row"><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a helpful reply…" className="min-h-24 flex-1 resize-y rounded-xl border border-[#cfd6cc] p-3 text-sm outline-none focus:border-[#64806b]" /><div className="flex flex-col gap-2"><select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as TicketStatus)} className="h-11 rounded-xl border border-[#cfd6cc] bg-white px-3 text-sm"><option value="open">Open</option><option value="pending">Pending</option><option value="resolved">Resolved</option></select><button disabled={sending || !message.trim()} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#17351f] px-5 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-50">{sending ? <><span className="spinner" />Sending…</> : <><Send className="size-4" />Reply</>}</button></div></div>{error && <p className="mt-2 text-sm text-rose-700">{error}</p>}</form></> : <div className="grid flex-1 place-items-center text-[#667069]">Select a support ticket.</div>}
    </section>
  </div>
}
