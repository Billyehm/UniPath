import Link from 'next/link'
import { ArrowLeft, UploadCloud } from 'lucide-react'

export default function UploadingDocumentsGuide() {
  return <div className="page-stack narrow-page">
    <Link className="back-link" href="/dashboard/support"><ArrowLeft />Help & Support</Link>
    <section className="adm-card">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e1ede0] text-[#17351f]"><UploadCloud className="size-6" /></span>
        <div>
          <p className="eyebrow-dark">Guidance</p>
          <h2 className="mt-1 text-2xl font-bold">Uploading documents</h2>
        </div>
      </div>
      <div className="guide-body">
        <h3>How to upload</h3>
        <ol>
          <li>Open <strong>My Documents</strong> from the sidebar.</li>
          <li>Tap the requirement you want to submit for. This opens its detail page.</li>
          <li>Drop your file into the upload area, or tap <strong>choose a file</strong> to pick one from your device.</li>
          <li>Tap <strong>Upload document</strong> and wait for the upload to finish.</li>
        </ol>
        <h3>Accepted files</h3>
        <ul>
          <li>Formats: PDF, JPG, JPEG, PNG, or WebP.</li>
          <li>Maximum size: 10 MB per file.</li>
          <li>Make sure the document is clear and readable. Blurry photos get sent back.</li>
        </ul>
        <h3>Replacing a document</h3>
        <p>If you already uploaded something and need to change it, open the same requirement and upload the new file. It replaces the old one. The button will read <strong>Replace document</strong> when a file already exists.</p>
        <h3>Written responses</h3>
        <p>Some requirements ask for a typed answer instead of a file. Type your response in the text box on the requirement page. It saves automatically when you tap outside the box.</p>
        <h3>What happens after you upload</h3>
        <p>Your submission moves to <strong>Processing</strong>. Our team reviews every file, usually within a few working days. You will see the status change on My Documents, and we will notify you if anything needs your attention.</p>
      </div>
    </section>
  </div>
}
