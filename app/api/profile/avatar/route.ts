import { NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: Request) {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const form = await request.formData().catch(() => null)
  const file = form?.get('avatar')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: 'Only JPG, PNG or WebP images are allowed' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 })
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${user.id}/avatar.${ext}`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 })
  const { error: updateError } = await supabase.from('user_profiles').update({ avatar_path: path }).eq('user_id', user.id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return NextResponse.json({ url: `${data.publicUrl}?v=${Date.now()}` })
}

export async function DELETE() {
  const { supabase, user } = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const { data: profile } = await supabase.from('user_profiles').select('avatar_path').eq('user_id', user.id).maybeSingle()
  if (profile?.avatar_path) await supabase.storage.from('avatars').remove([profile.avatar_path])
  await supabase.from('user_profiles').update({ avatar_path: null }).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
