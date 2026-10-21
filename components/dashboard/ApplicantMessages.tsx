'use client'

import { FormEvent, useState } from 'react'
import { MessageCircle, Plus, Send } from 'lucide-react'
import type { TableRow } from '@/lib/database.types'
import { formatDateTime } from '@/lib/format'

type Ticket = TableRow<'support_tickets'> & { messages: TableRow<'support_messages'>[] }

function preview(ticket: Ticket) {
  const last = ticket.messages[ticket.messages.length - 1]
  const body = last?.body ?? ''
  return body.length > 64 ? `${body.slice(0, 64)}…` : body
}

export default function ApplicantMessages({ initialTickets, userId }: { initialTickets: Ticket[]; userId: string }) {
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedId, setSelectedId] = useState(initialTickets[0]?.id ?? '')
  const [draft, setDraft] = useState('')
  const [creating, setCreating] = useState(!initialTickets.length)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const selected = tickets.find((ticket) => ticket.id === selectedId)

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    const text = draft.trim()
    if (!text || sending) return
    setSending(true)
    const now = new Date().toISOString()
    if (creating) {
      const subject = text.length > 80 ? `${text.slice(0, 80)}…` : text
      const response = await fetch('/api/support/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, message: text, priority: 'normal' }) })
      const result = await response.json()
      if (!response.ok) { setError(result.error || 'Unable to send message'); setSending(false); return }
      const ticket: Ticket = { id: result.id, user_id: userId, subject, status: 'open', priority: 'normal', assigned_to: null, created_at: now, updated_at: now, resolved_at: null, messages: [{ id: crypto.randomUUID(), ticket_id: result.id, sender_user_id: userId, body: text, is_internal: false, created_at: now }] }
      setTickets((items) => [ticket, ...items])
      setSelectedId(ticket.id)
      setCreating(false)
    } else {
      const response = await fetch(`/api/support/tickets/${selectedId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, internal: false }) })
      const result = await response.json()
      if (!response.ok) { setError(result.error || 'Unable to send message'); setSending(false); return }
      setTickets((items) => items.map((ticket) => ticket.id === selectedId ? { ...ticket, messages: [...ticket.messages, { id: result.id, ticket_id: ticket.id, sender_user_id: userId, body: text, is_internal: false, created_at: now }] } : ticket))
    }
    setDraft(''); setSending(false)
  }

  return <div className="grid min-h-[620px] overflow-hidden rounded-3xl border border-[#dfe3da] bg-white lg:grid-cols-[320px_1fr]">
    <aside className="border-b border-[#dfe3da] p-4 lg:border-b-0 lg:border-r">
      <button onClick={() => { setCreating(true); setSelectedId('') }} className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#17351f] px-4 py-3 text-sm font-bold text-white"><Plus className="size-4" />New conversation</button>
      <div className="space-y-2">
        {tickets.map((ticket) => {
          const last = ticket.messages[ticket.messages.length - 1]
          const active = ticket.id === selectedId && !creating
          return <button key={ticket.id} onClick={() => { setCreating(false); setSelectedId(ticket.id) }} className={`w-full rounded-xl p-3 text-left ${active ? 'bg-[#eff4ea]' : 'hover:bg-[#f7f8f3]'}`}>
            <span className="block truncate text-sm font-medium">{preview(ticket) || 'Conversation'}</span>
            <span className="mt-1 block text-xs text-[#667069]">{last ? formatDateTime(last.created_at) : ''}</span>
          </button>
        })}
        {!tickets.length && <p className="px-1 text-sm text-[#667069]">No conversations yet.</p>}
      </div>
    </aside>
    <section className="flex min-w-0 flex-col">
      <header className="border-b border-[#dfe3da] p-5">
        {creating || !selected ? <>
          <h2 className="text-xl font-bold">Start a conversation</h2>
          <p className="text-sm text-[#667069]">Ask us anything. We reply weekdays, 8 AM–6 PM WAT.</p>
        </> : <>
          <h2 className="text-xl font-bold">Support chat</h2>
          <p className="text-sm text-[#667069]">Started {formatDateTime(selected.created_at)}</p>
        </>}
      </header>
      <div className="flex flex-1 flex-col gap-3 bg-[#fafbf8] p-5">
        {!creating && selected?.messages.map((message) => {
          const mine = message.sender_user_id === userId
          return <article key={message.id} className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? 'ml-auto bg-[#17351f] text-white' : 'bg-white ring-1 ring-[#dfe3da]'}`}>
            <p>{message.body}</p>
            <time className="mt-1 block text-xs opacity-60">{formatDateTime(message.created_at)}</time>
          </article>
        })}
        {creating && <div className="m-auto max-w-xs text-center text-[#667069]">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#eff4ea] text-[#31583b]"><MessageCircle className="size-5" /></span>
          <p className="mt-4 text-sm leading-6">How can we help? Write your message below and send it to start chatting with support.</p>
        </div>}
      </div>
      <form onSubmit={submit} className="border-t border-[#dfe3da] p-4">
        <div className="flex gap-2">
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="min-h-16 flex-1 rounded-xl border border-[#cfd6cc] p-3 text-sm" placeholder="Write your message…" required />
          <button disabled={sending} className="grid size-12 shrink-0 place-items-center self-end rounded-full bg-[#17351f] text-white transition-transform active:scale-90 disabled:opacity-60" aria-label="Send">{sending ? <span className="spinner" /> : <Send className="size-4" />}</button>
        </div>
        {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
      </form>
    </section>
  </div>
}
