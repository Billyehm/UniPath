import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { listInstitutions } from '@/lib/institutions-source'

const TYPES = new Set(['university', 'polytechnic', 'college_of_education'])

export async function GET(request: Request) {
  const { user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const search = new URL(request.url).searchParams
  const type = search.get('type') || ''
  const result = await listInstitutions({
    q: (search.get('q') || '').trim().slice(0, 80),
    type: TYPES.has(type) ? type : '',
    state: (search.get('state') || '').trim().slice(0, 40),
    limit: Math.min(Math.max(Number(search.get('limit')) || 48, 1), 100),
    offset: Math.max(Number(search.get('offset')) || 0, 0),
  })
  return NextResponse.json(result)
}
