import { Bell, KeyRound, ShieldCheck, UserRound } from 'lucide-react'
import { requireStaff } from '@/lib/auth'

export default async function AdminSettingsPage() {
  const user = await requireStaff()
  const settings = [{ title: 'Profile and identity', text: `${user.displayName} · ${user.email}`, icon: UserRound }, { title: 'Password and security', text: 'Manage your Supabase Auth credentials and sessions.', icon: KeyRound }, { title: 'Team notifications', text: 'Choose which queues and review events notify you.', icon: Bell }, { title: 'Access level', text: `Your current role is ${user.role.replace('_', ' ')}.`, icon: ShieldCheck }]
  return <div className="mx-auto max-w-4xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Account</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Settings</h2><section className="mt-7 overflow-hidden rounded-2xl border border-[#dfe3da] bg-white">{settings.map(({ title, text, icon: Icon }) => <button key={title} className="flex w-full items-center gap-4 border-b border-[#edf0e9] p-5 text-left last:border-0"><span className="grid size-11 place-items-center rounded-xl bg-[#eff4ea] text-[#17351f]"><Icon className="size-5" /></span><div><h3 className="font-bold">{title}</h3><p className="text-sm text-[#667069]">{text}</p></div></button>)}</section></div>
}
