import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { getInstitutionDetail } from '@/lib/institutions-source'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { id } = await params
  if (!/^[a-z0-9-]{1,80}$/.test(id)) return NextResponse.json({ error: 'Invalid institution' }, { status: 400 })

  const result = await getInstitutionDetail(id)
  if (!result) return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
  return NextResponse.json(result)
}
