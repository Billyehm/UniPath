import { ShieldCheck } from 'lucide-react'
import { requireAdmin } from '@/lib/auth'
import { getRecentActivity } from '@/lib/data/admin'

export default async function AccessLogsPage() {
  await requireAdmin()
  const activity = await getRecentActivity(50)
  return <div className="mx-auto max-w-7xl"><div className="mb-6"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Accountability</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Audit logs</h2></div><section className="overflow-x-auto rounded-3xl border border-[#dfe3da] bg-white"><div className="min-w-[760px]"><div className="grid grid-cols-[1fr_1fr_1.2fr_190px] gap-4 border-b border-[#dfe3da] bg-[#f7f8f3] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#667069]"><span>Team member</span><span>Entity</span><span>Action</span><span>Date</span></div>{activity.map((item) => <div key={item.id} className="grid grid-cols-[1fr_1fr_1.2fr_190px] gap-4 border-b border-[#edf0e9] px-5 py-4 text-sm last:border-0"><strong>{item.actorName}</strong><span>{item.entityType}</span><span className="capitalize">{item.action.replaceAll('.', ' ')}</span><time className="text-[#667069]">{new Date(item.createdAt).toLocaleString()}</time></div>)}{!activity.length && <p className="py-16 text-center text-sm text-[#667069]">No audit events yet.</p>}</div><div className="flex items-center gap-3 bg-[#eff4ea] p-4 text-sm text-[#31583b]"><ShieldCheck className="size-5" /><span><strong>Database authorization is active.</strong> Sensitive operations are protected by row-level security and logged.</span></div></section></div>
}
