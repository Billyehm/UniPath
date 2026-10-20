import DocumentReviewList from '@/components/admin/DocumentReviewList'
import { getDocumentsForReview } from '@/lib/data/admin'

export default async function AdminDocumentsPage() {
  const documents = await getDocumentsForReview()
  return <div className="mx-auto max-w-7xl"><div className="mb-6"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#54725d]">Verification queue</p><h2 className="mt-2 text-4xl font-semibold tracking-[-.045em]">Document reviews</h2><p className="mt-2 text-[#667069]">Review uploads and record decisions.</p></div><DocumentReviewList documents={documents} /></div>
}
