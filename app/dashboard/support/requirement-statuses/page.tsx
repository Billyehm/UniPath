import Link from 'next/link'
import { AlertCircle, ArrowLeft, CheckCircle2, Circle, Clock3, FileWarning } from 'lucide-react'

const statuses = [
  { icon: Circle, name: 'Not started', text: 'You have not submitted anything for this requirement yet. Open it to see what is needed.' },
  { icon: Clock3, name: 'Processing', text: 'Your submission is in. Our team is reviewing it. You do not need to do anything while it shows this status.' },
  { icon: AlertCircle, name: 'Action needed', text: 'Something needs your attention. Open the requirement to see what the team asked for, then fix it and resubmit.' },
  { icon: CheckCircle2, name: 'Completed', text: 'Approved. This requirement is done and there is nothing more to do here.' },
]

export default function RequirementStatusesGuide() {
  return <div className="page-stack narrow-page">
    <Link className="back-link" href="/dashboard/support"><ArrowLeft />Help & Support</Link>
    <section className="adm-card">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e1ede0] text-[#17351f]"><FileWarning className="size-6" /></span>
        <div>
          <p className="eyebrow-dark">Guidance</p>
          <h2 className="mt-1 text-2xl font-bold">Requirement statuses</h2>
        </div>
      </div>
      <div className="guide-body">
        <p>Every item on your checklist carries a status badge. Here is what each one means and what you should do about it.</p>
        <div className="guide-status-list">
          {statuses.map(({ icon: Icon, name, text }) => (
            <div key={name} className="guide-status-row">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eff4ea] text-[#17351f]"><Icon className="size-5" /></span>
              <div><strong>{name}</strong><p>{text}</p></div>
            </div>
          ))}
        </div>
        <h3>A note on Action needed</h3>
        <p>This is the only status that asks something of you. Common reasons are a blurry upload, a wrong document, or a missing page. Open the requirement, read the note from the team, and upload a corrected file. Your resubmission goes back into Processing.</p>
      </div>
    </section>
  </div>
}
