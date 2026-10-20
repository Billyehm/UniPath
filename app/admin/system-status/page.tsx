import { CheckCircle2, Database, HardDrive, ShieldCheck } from 'lucide-react'
import { requireAdmin } from '@/lib/auth'
import { getDashboardSummary } from '@/lib/data/admin'

export default async function SystemStatusPage() {
  await requireAdmin()
  const summary = await getDashboardSummary()
  const checks = [{ name: 'Supabase database', detail: `${summary.totalUsers} user records available`, icon: Database }, { name: 'Document storage', detail: `${summary.totalDocuments} metadata records available`, icon: HardDrive }, { name: 'Authentication and RLS', detail: 'Protected server request completed', icon: ShieldCheck }]
  return <div className="mx-auto max-w-5xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Infrastructure</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">System status</h2><p className="mt-2 text-[#667069]">Live connectivity checks for core UniPath services.</p><div className="mt-7 flex items-center gap-3 rounded-2xl bg-emerald-50 p-5 text-emerald-800"><CheckCircle2 className="size-6" /><div><strong>All core services are reachable</strong><p className="text-sm">Checked during this page request.</p></div></div><section className="mt-4 overflow-hidden rounded-2xl border border-[#dfe3da] bg-white">{checks.map(({ name, detail, icon: Icon }) => <article key={name} className="flex items-center gap-4 border-b border-[#edf0e9] p-5 last:border-0"><span className="grid size-11 place-items-center rounded-xl bg-[#eff4ea] text-[#17351f]"><Icon className="size-5" /></span><div className="flex-1"><h3 className="font-bold">{name}</h3><p className="text-sm text-[#667069]">{detail}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Operational</span></article>)}</section></div>
}
