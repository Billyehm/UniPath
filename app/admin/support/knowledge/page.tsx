import { BookOpen, Camera, FileText, GraduationCap, Search } from 'lucide-react'

const guides = [
  { title: 'Document quality checklist', text: 'What to verify before approving WAEC, JAMB, and identity documents.', icon: FileText },
  { title: 'Passport photograph guidance', text: 'Background, lighting, framing, and clarity requirements.', icon: Camera },
  { title: 'Admissions escalation guide', text: 'When and how to escalate university or JAMB-related questions.', icon: GraduationCap },
]

export default function KnowledgePage() {
  return <div className="mx-auto max-w-6xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Support tools</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Knowledge base</h2><p className="mt-2 text-[#667069]">Review guidance for the support team.</p><label className="mt-7 flex h-12 max-w-xl items-center gap-3 rounded-xl border border-[#dfe3da] bg-white px-4"><Search className="size-4 text-[#667069]" /><input className="min-w-0 flex-1 outline-none" placeholder="Search guidance" /></label><section className="mt-6 grid gap-4 md:grid-cols-3">{guides.map(({ title, text, icon: Icon }) => <article key={title} className="rounded-2xl border border-[#dfe3da] bg-white p-5"><span className="grid size-11 place-items-center rounded-xl bg-[#eff4ea] text-[#17351f]"><Icon className="size-5" /></span><h3 className="mt-6 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#667069]">{text}</p><button className="mt-5 flex items-center gap-2 text-sm font-bold text-[#31583b]"><BookOpen className="size-4" />Read guide</button></article>)}</section></div>
}
