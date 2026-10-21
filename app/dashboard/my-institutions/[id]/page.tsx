import { redirect } from 'next/navigation'

// The old curated university detail page. University selection now runs on the
// institutions directory, so deep links land on the directory detail page.
export default async function UniversityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/dashboard/institutions/${id}`)
}
