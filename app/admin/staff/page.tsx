import { ShieldCheck, UserRoundCog } from 'lucide-react'
import { requireAdmin } from '@/lib/auth'
import { getStaff } from '@/lib/data/admin'

export default async function StaffPage() {
  await requireAdmin()
  const staff = await getStaff()
  return <div className="mx-auto max-w-6xl"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Access control</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Staff</h2><p className="mt-2 text-[#667069]">Accounts with internal access.</p></div><button className="rounded-xl bg-[#17351f] px-5 py-3 text-sm font-bold text-white">Invite staff member</button></div><section className="mt-7 overflow-hidden rounded-2xl border border-[#dfe3da] bg-white">{staff.map((member) => <article key={member.id} className="flex flex-wrap items-center gap-4 border-b border-[#edf0e9] p-5 last:border-0"><span className="grid size-11 place-items-center rounded-full bg-[#eff4ea] text-[#17351f]"><UserRoundCog className="size-5" /></span><div className="min-w-[220px] flex-1"><h3 className="font-bold">{member.name}</h3><p className="text-sm text-[#667069]">{member.email}</p></div><span className="flex items-center gap-1.5 rounded-full bg-[#eff4ea] px-3 py-1.5 text-xs font-bold capitalize text-[#31583b]"><ShieldCheck className="size-3.5" />{member.role.replace('_', ' ')}</span><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${member.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{member.active ? 'Active' : 'Disabled'}</span></article>)}{!staff.length && <p className="py-16 text-center text-sm text-[#667069]">No staff records found.</p>}</section></div>
}
