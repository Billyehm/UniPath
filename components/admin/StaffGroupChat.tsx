'use client'

import { FormEvent, PointerEvent, useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, CornerUpRight, Edit3, History, Send, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { StaffChatMessage } from '@/lib/models'

const staffTimestamp = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Lagos',
})

export default function StaffGroupChat({ initialMessages, currentUserId }: { initialMessages: StaffChatMessage[]; currentUserId: string }) {
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState<StaffChatMessage | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [openVersions, setOpenVersions] = useState<string | null>(null)
  const [swipedId, setSwipedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const swipeStart = useRef<{ id: string; x: number } | null>(null)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  async function send(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim()) return
    const body = draft.trim()
    const optimisticId = `optimistic-${Date.now()}`
    const optimisticMessage: StaffChatMessage = {
      id: optimisticId,
      senderId: currentUserId,
      senderName: messages.find((message) => message.senderId === currentUserId)?.senderName || 'You',
      body,
      replyToId: replyTo?.id ?? null,
      replyToName: replyTo?.senderName ?? null,
      replyToBody: replyTo?.body ?? null,
      createdAt: new Date().toISOString(),
      editedAt: null,
      versions: [],
    }
    setSaving(true); setError('')
    setMessages((items) => [...items, optimisticMessage])
    setDraft(''); setReplyTo(null)
    const response = await fetch('/api/admin/staff-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body, replyToId: optimisticMessage.replyToId }) })
    const result = await response.json()
    if (!response.ok) { setMessages((items) => items.filter((item) => item.id !== optimisticId)); setDraft(body); setError(result.error || 'Unable to send message.'); setSaving(false); return }
    setMessages((items) => items.map((item) => item.id === optimisticId ? result.message as StaffChatMessage : item))
    setSaving(false); router.refresh()
  }

  async function saveEdit(message: StaffChatMessage) {
    if (!editBody.trim()) return
    const body = editBody.trim()
    const optimisticMessage: StaffChatMessage = { ...message, body, editedAt: new Date().toISOString() }
    setSaving(true); setError('')
    setMessages((items) => items.map((item) => item.id === message.id ? optimisticMessage : item))
    setEditingId(null); setEditBody('')
    const response = await fetch(`/api/admin/staff-chat/${message.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) })
    const result = await response.json()
    if (!response.ok) { setMessages((items) => items.map((item) => item.id === message.id ? message : item)); setError(result.error || 'Unable to edit message.'); setSaving(false); return }
    setMessages((items) => items.map((item) => item.id === message.id ? result.message as StaffChatMessage : item))
    setSaving(false); router.refresh()
  }

  function startSwipe(event: PointerEvent<HTMLDivElement>, message: StaffChatMessage) {
    if ((event.target as HTMLElement).closest('button, textarea')) return
    swipeStart.current = { id: message.id, x: event.clientX }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function moveSwipe(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button, textarea')) return
    const start = swipeStart.current
    if (!start || start.id !== event.currentTarget.dataset.messageId) return
    if (event.clientX - start.x > 28) setSwipedId(start.id)
  }
  function endSwipe(event: PointerEvent<HTMLDivElement>, message: StaffChatMessage) {
    if ((event.target as HTMLElement).closest('button, textarea')) return
    const start = swipeStart.current
    if (start && event.clientX - start.x > 42) setReplyTo(message)
    swipeStart.current = null
    window.setTimeout(() => setSwipedId(null), 180)
  }

  return <div className="overflow-hidden rounded-3xl border border-[#dfe3da] bg-white"><div className="border-b border-[#dfe3da] bg-[#f7f8f3] px-5 py-4"><h3 className="font-bold">Staff conversation</h3><p className="mt-1 text-sm text-[#667069]">Swipe a message right to reply.</p></div><div className="max-h-[620px] space-y-3 overflow-y-auto bg-[#fafbf8] p-4 sm:p-6">{messages.map((message) => { const mine = message.senderId === currentUserId; const isEditing = editingId === message.id; return <div key={message.id} data-message-id={message.id} onPointerDown={(event) => startSwipe(event, message)} onPointerMove={moveSwipe} onPointerUp={(event) => endSwipe(event, message)} className="relative overflow-hidden rounded-2xl"><div className="absolute inset-y-0 left-0 flex w-16 items-center justify-center text-[#31583b]"><CornerUpRight className="size-5" /></div><article className={`relative max-w-[88%] rounded-2xl px-4 py-3 transition-transform duration-200 ${mine ? 'ml-auto bg-[#17351f] text-white' : 'bg-white text-[#17231b] ring-1 ring-[#dfe3da]'} ${swipedId === message.id ? 'translate-x-12' : 'translate-x-0'}`}><div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"><strong className={mine ? 'text-[#d8ff63]' : 'text-[#31583b]'}>{message.senderName}</strong><time className={mine ? 'text-white/55' : 'text-[#7c857f]'}>{staffTimestamp.format(new Date(message.createdAt))}</time></div>{message.replyToId && <div className={`mb-2 rounded-lg border-l-2 px-3 py-2 text-xs ${mine ? 'border-[#d8ff63] bg-white/10 text-white/75' : 'border-[#64806b] bg-[#eff4ea] text-[#526157]'}`}><strong>{message.replyToName}</strong><p className="mt-1 line-clamp-2">{message.replyToBody}</p></div>}{isEditing ? <div><textarea value={editBody} onChange={(event) => setEditBody(event.target.value)} className="min-h-24 w-full rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-inherit outline-none" /><div className="mt-2 flex gap-2"><button type="button" onClick={() => saveEdit(message)} disabled={saving} className="rounded-lg bg-[#d8ff63] px-3 py-2 text-xs font-bold text-[#17351f]"><Check className="mr-1 inline size-3" />Save</button><button type="button" onClick={() => setEditingId(null)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold"><X className="mr-1 inline size-3" />Cancel</button></div></div> : <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>}<div className="mt-2 flex flex-wrap items-center gap-3 text-xs"><button type="button" onClick={() => setReplyTo(message)} className={mine ? 'text-white/60 hover:text-white' : 'text-[#667069] hover:text-[#17351f]'}><CornerUpRight className="mr-1 inline size-3" />Reply</button>{mine && !isEditing && <button type="button" onClick={() => { setEditingId(message.id); setEditBody(message.body) }} className="text-white/60 hover:text-white"><Edit3 className="mr-1 inline size-3" />Edit</button>}{message.editedAt && <button type="button" onClick={() => setOpenVersions(openVersions === message.id ? null : message.id)} className={mine ? 'text-white/60 hover:text-white' : 'text-[#667069] hover:text-[#17351f]'}><History className="mr-1 inline size-3" />Edited <ChevronDown className={`inline size-3 transition ${openVersions === message.id ? 'rotate-180' : ''}`} /></button>}</div>{openVersions === message.id && <div className={`mt-3 space-y-2 rounded-xl p-3 text-xs ${mine ? 'bg-white/10' : 'bg-[#f7f8f3]'}`}><strong>Previous versions</strong>{message.versions.map((version) => <div key={version.id} className="border-t border-current/10 pt-2"><span className="opacity-60">Version {version.version} · {staffTimestamp.format(new Date(version.createdAt))}</span><p className="mt-1 whitespace-pre-wrap">{version.body}</p></div>)}</div>}</article></div>})}{!messages.length && <div className="py-16 text-center text-sm text-[#667069]">No staff messages yet. Start the conversation.</div>}</div><form onSubmit={send} className="border-t border-[#dfe3da] p-4 sm:p-5">{replyTo && <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-[#eff4ea] px-3 py-2 text-sm"><span className="min-w-0 truncate">Replying to <strong>{replyTo.senderName}</strong>: {replyTo.body}</span><button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply"><X className="size-4" /></button></div>}<div className="flex gap-2"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="min-h-20 flex-1 rounded-xl border border-[#cfd6cc] p-3 text-sm outline-none focus:border-[#64806b]" placeholder="Write a message to the team…" required /><button disabled={saving || !draft.trim()} className="grid size-12 shrink-0 place-items-center self-end rounded-xl bg-[#17351f] text-white transition-transform active:scale-90 disabled:opacity-60" aria-label="Send message">{saving ? <span className="spinner" /> : <Send className="size-4" />}</button></div>{error && <p className="mt-2 text-sm text-rose-700">{error}</p>}</form></div>
}
