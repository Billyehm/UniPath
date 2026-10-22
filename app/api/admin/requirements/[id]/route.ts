import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { requirementSchema, zodErrorMessage } from '@/lib/validation'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const parsed = requirementSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 })
  const { id } = await params
  const { error } = await supabase.rpc('update_requirement', {
    requirement_id: id,
    requirement_title: parsed.data.title,
    requirement_subtitle: parsed.data.subtitle,
    requirement_guidance: parsed.data.guidance ?? '',
    requirement_submission_type: parsed.data.submissionType,
    requirement_amount_kobo: parsed.data.amountKobo ?? null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const { id } = await params
  const { error } = await supabase.rpc('delete_requirement', { requirement_id: id })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
