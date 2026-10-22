import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { requirementSchema, zodErrorMessage } from '@/lib/validation'

export async function POST(request: Request) {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const parsed = requirementSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 })
  const { data, error } = await supabase.rpc('create_requirement', {
    requirement_title: parsed.data.title,
    requirement_subtitle: parsed.data.subtitle,
    requirement_guidance: parsed.data.guidance ?? '',
    requirement_submission_type: parsed.data.submissionType,
    requirement_amount_kobo: parsed.data.amountKobo ?? null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data })
}
