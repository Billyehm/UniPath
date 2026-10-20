import Image from "next/image"
import {
  ArrowRight, Building2, CalendarDays, Check, ChevronDown, FileCheck2,
  GraduationCap, LockKeyhole, Mail, Menu, MessageCircle,
} from "lucide-react"
import StoriesRotator from "@/components/StoriesRotator"

const steps = [
  ["01", "Build your profile", "Tell us your goals, results, and preferred courses. It only takes a few minutes."],
  ["02", "Follow your roadmap", "Get a clear, personal checklist for every school and deadline on your list."],
  ["03", "Apply with confidence", "Keep documents ready, track progress, and get support whenever you need it."],
]

const features = [
  [CalendarDays, "One clear timeline", "See applications, deadlines, and next actions without jumping between spreadsheets and chats."],
  [FileCheck2, "Documents, organised", "Know exactly what is ready and what is missing for every application on your shortlist."],
  [MessageCircle, "Human guidance", "Get practical answers from people who understand the admissions journey in Nigeria."],
  [LockKeyhole, "Private by default", "Your personal information and academic records stay protected and in your control."],
] as const

const faqs = [
  ["Who is UniPath for?", "UniPath is designed for secondary-school leavers, current applicants, and families who want a simpler way to manage university admissions."],
  ["Can I track more than one university?", "Yes. You can keep multiple universities and courses in one place, with a separate checklist and timeline for each application."],
  ["Is my information secure?", "Yes. UniPath is built around secure access and clear privacy controls, so your documents remain yours."],
  ["How much does it cost?", "You can start for free. If you need more advanced guidance later, you will always see the price before choosing a paid plan."],
]

export default function Page() {
  return <main className="overflow-hidden bg-[#f7f8f3] text-[#17231b]">
    <section id="top" className="relative min-h-[760px] overflow-hidden bg-[#15271d] sm:min-h-[820px]">
      <Image src="/hero-school.jpg" alt="Students walking across a university campus" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,20,.93),rgba(11,31,20,.68)_52%,rgba(11,31,20,.24))]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f14]/75 via-transparent to-transparent" />
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a href="#top" className="flex items-center gap-2.5 text-white"><span className="grid size-10 place-items-center rounded-xl bg-[#d8ff63] text-[#17351f]"><GraduationCap className="size-5" /></span><span className="text-xl font-semibold tracking-[-.04em]">UniPath</span></a>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation"><a className="nav-link" href="#how">How it works</a><a className="nav-link" href="#features">Features</a><a className="nav-link" href="#stories">Stories</a><a className="nav-link" href="#faq">FAQs</a></nav>
        <a href="/auth" className="button-light hidden lg:inline-flex">Get started <ArrowRight className="size-4" /></a>
        <details className="relative lg:hidden"><summary aria-label="Open menu" className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-white/25 bg-white/10 text-white [&::-webkit-details-marker]:hidden"><Menu className="size-5" /></summary><nav className="absolute right-0 top-14 flex w-56 flex-col gap-1 rounded-2xl bg-white p-2 shadow-xl"><a className="mobile-link" href="#how">How it works</a><a className="mobile-link" href="#features">Features</a><a className="mobile-link" href="#stories">Stories</a><a className="mobile-link" href="#faq">FAQs</a><a className="mt-1 rounded-xl bg-[#17351f] px-4 py-3 text-center text-sm font-semibold text-white" href="/auth">Get started</a></nav></details>
      </header>
      <div className="relative z-10 mx-auto flex min-h-[660px] max-w-7xl items-center px-5 pb-24 pt-16 sm:px-8 lg:px-10">
      <div className="max-w-3xl"><p className="hero-reveal inline-flex rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm sm:text-sm">University applications, made simpler</p><h1 className="hero-reveal hero-delay-1 mt-6 text-balance text-[clamp(3.2rem,8vw,6.7rem)] font-medium leading-[.9] tracking-[-.065em] text-white">A clearer path to university.</h1><p className="hero-reveal hero-delay-2 mt-7 max-w-xl text-pretty text-base leading-7 text-white/80 sm:text-lg sm:leading-8">Bring every requirement, document, and deadline together. UniPath helps you move from shortlist to admission without the confusion.</p><div className="hero-reveal hero-delay-3 mt-9 flex flex-col gap-3 sm:flex-row"><a href="/auth" className="button-lime">Start your application <ArrowRight className="size-4" /></a><a href="#how" className="button-ghost">See how it works</a></div><div className="hero-reveal hero-delay-3 mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">{["Free to start", "No card required", "Built for Nigeria"].map(text => <span key={text} className="flex items-center gap-2"><Check className="size-4 text-[#d8ff63]" />{text}</span>)}</div></div>
      </div>
    </section>

    <section className="border-b border-[#dfe3da] bg-white"><div className="mx-auto grid max-w-7xl grid-cols-2 px-5 md:grid-cols-4">{[["10k+","students supported"],["36","universities covered"],["96%","tasks completed"],["4.9/5","student rating"]].map(([value,label]) => <div key={label} className="border-b border-[#e5e8e1] py-8 text-center even:border-l md:border-b-0 md:border-l md:first:border-l-0"><p className="text-2xl font-semibold tracking-[-.04em] text-[#17351f] sm:text-3xl">{value}</p><p className="mt-1 text-xs text-[#667069] sm:text-sm">{label}</p></div>)}</div></section>

    <section id="how" className="scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32 lg:px-10"><div className="mx-auto max-w-7xl"><p className="eyebrow">A calmer way to apply</p><h2 className="section-title mt-4 max-w-2xl">Three steps. One place. No guesswork.</h2><div className="mt-14 grid gap-4 lg:grid-cols-3">{steps.map(([number,title,text]) => <article key={number} className="group rounded-[22px] border border-[#dfe3da] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(23,53,31,.08)]"><div className="flex justify-between"><span className="text-sm font-semibold text-[#54725d]">STEP {number}</span><span className="grid size-10 place-items-center rounded-full bg-[#eff4ea] group-hover:bg-[#d8ff63]"><ArrowRight className="size-4 -rotate-45" /></span></div><h3 className="mt-8 text-xl font-semibold tracking-[-.04em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#667069]">{text}</p></article>)}</div></div></section>

    <section id="features" className="scroll-mt-16 bg-[#17351f] px-5 py-24 text-white sm:px-8 sm:py-32 lg:px-10"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-20"><div><p className="eyebrow text-[#d8ff63]">Everything in view</p><h2 className="section-title mt-4 text-white">Stay ready for every next step.</h2><p className="mt-6 max-w-lg text-lg leading-8 text-white/70">UniPath turns a complicated admissions process into a simple workspace you can understand at a glance.</p><div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[30px]"><Image src="/hero-study.jpg" alt="Students studying together on a university campus" fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#0a1f13]/70 to-transparent" /><div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"><span className="grid size-10 place-items-center rounded-full bg-[#d8ff63] text-[#17351f]"><Check className="size-5" /></span><div><p className="text-sm font-semibold">Application on track</p><p className="text-xs text-white/65">8 of 10 requirements complete</p></div></div></div></div><div className="grid gap-3 sm:grid-cols-2">{features.map(([Icon,title,text]) => <article key={title} className="rounded-[20px] border border-white/10 bg-white/[.05] p-5"><span className="grid size-10 place-items-center rounded-xl bg-[#d8ff63] text-[#17351f]"><Icon className="size-5" /></span><h3 className="mt-5 text-lg font-semibold tracking-[-.035em]">{title}</h3><p className="mt-2 text-sm leading-6 text-white/65">{text}</p></article>)}</div></div></section>

    <section id="stories" className="scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32 lg:px-10"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-end"><div><p className="eyebrow">Student stories</p><h2 className="section-title mt-4">Clarity changes everything.</h2><p className="mt-5 leading-7 text-[#667069]">Real support for a decision that shapes your future.</p></div><StoriesRotator /></div></section>

    <section id="faq" className="scroll-mt-16 border-y border-[#dfe3da] bg-white px-5 py-24 sm:px-8 sm:py-32 lg:px-10"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20"><div><p className="eyebrow">Questions, answered</p><h2 className="section-title mt-4">A few things you may want to know.</h2></div><div className="divide-y divide-[#dfe3da] border-y border-[#dfe3da]">{faqs.map(([question,answer]) => <details key={question} className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">{question}<span className="grid size-9 place-items-center rounded-full bg-[#eff4ea] transition group-open:rotate-180"><ChevronDown className="size-4" /></span></summary><p className="max-w-2xl pb-6 pr-12 leading-7 text-[#667069]">{answer}</p></details>)}</div></div></section>

    <section id="contact" className="px-5 py-6 sm:px-8 lg:px-10"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#d8ff63] px-6 py-16 sm:px-12 sm:py-20 lg:px-20"><Building2 className="absolute -right-6 -top-6 size-64 text-[#17351f]/5" /><div className="relative max-w-3xl"><p className="eyebrow">Your next step</p><h2 className="mt-4 text-balance text-4xl font-medium leading-[.98] tracking-[-.055em] sm:text-6xl">Make your application easier to manage.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-[#425246]">Join students building a clearer path to university with UniPath.</p><a href="mailto:hello@unipath.ng?subject=I%20want%20to%20get%20started" className="button-dark mt-8">Get started for free <ArrowRight className="size-4" /></a></div></div></section>

    <footer className="px-5 pb-8 pt-14 sm:px-8 lg:px-10"><div className="mx-auto max-w-7xl border-t border-[#dfe3da] pt-8"><div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between"><a href="#top" className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-[#17351f] text-[#d8ff63]"><GraduationCap className="size-5" /></span><span className="text-xl font-semibold">UniPath</span></a><div className="flex flex-wrap gap-6 text-sm text-[#667069]"><a href="#features">Features</a><a href="#faq">FAQs</a><a href="mailto:hello@unipath.ng"><Mail className="mr-1.5 inline size-4" />hello@unipath.ng</a></div></div><div className="mt-10 flex flex-col gap-2 border-t border-[#dfe3da] pt-5 text-xs text-[#7c857f] sm:flex-row sm:justify-between"><p>© 2026 UniPath. All rights reserved.</p><p>Built to help students move forward.</p></div></div></footer>
  </main>
}
