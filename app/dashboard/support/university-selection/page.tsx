import Link from 'next/link'
import { ArrowLeft, BookOpen, School } from 'lucide-react'

export default function UniversitySelectionGuide() {
  return <div className="page-stack narrow-page">
    <Link className="back-link" href="/dashboard/support"><ArrowLeft />Help & Support</Link>
    <section className="adm-card">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e1ede0] text-[#17351f]"><BookOpen className="size-6" /></span>
        <div>
          <p className="eyebrow-dark">Guidance</p>
          <h2 className="mt-1 text-2xl font-bold">University selection</h2>
        </div>
      </div>
      <div className="guide-body">
        <h3>Choosing your institutions</h3>
        <ol>
          <li>Open <strong>My Institutions</strong> from the sidebar.</li>
          <li>Browse or search the full directory of 752 institutions: universities, polytechnics, and colleges of education.</li>
          <li>Tap an institution to add it to your picks. You can pick up to <strong>three</strong>.</li>
          <li>Your picks appear in a pinned list at the top so you always see them first.</li>
        </ol>
        <h3>Changing your picks</h3>
        <p>Tap the <strong>x</strong> on any pick to remove it, then choose another. You can change your selections any time before your application is finalized.</p>
        <h3>Exploring institutions</h3>
        <p>Tap any institution name to open its profile: courses offered, institution type, and location. Use the course search to check whether your intended course is available before you pick the school.</p>
        <h3>What your picks are used for</h3>
        <p>Your selected institutions shape your application. Document requirements and updates from our team are matched to the schools you picked, so keep the list accurate.</p>
      </div>
    </section>
  </div>
}
