import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { listCourses } from '@/lib/institutions-source'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const { id } = await params
  if (!/^[a-z0-9-]{1,80}$/.test(id)) return NextResponse.json({ error: 'Invalid institution' }, { status: 400 })

  const search = new URL(request.url).searchParams
  const result = await listCourses(id, {
    q: (search.get('q') || '').trim().slice(0, 80),
    limit: Math.min(Math.max(Number(search.get('limit')) || 100, 1), 200),
    offset: Math.max(Number(search.get('offset')) || 0, 0),
  })
  return NextResponse.json(result)
}
