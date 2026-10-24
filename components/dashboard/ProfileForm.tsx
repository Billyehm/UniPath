'use client'

import { FormEvent, useRef, useState } from 'react'
import { Camera, Check, Mail, Phone, UserRound } from 'lucide-react'
import type { TableRow } from '@/lib/database.types'
import LogoutButton from '@/components/dashboard/LogoutButton'

export default function ProfileForm({ user, profile, application, avatarUrl }: { user: TableRow<'users'>; profile: TableRow<'user_profiles'>; application: TableRow<'applications'> | null; avatarUrl: string | null }) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [avatar, setAvatar] = useState<string | null>(avatarUrl)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadAvatar(file: File) {
    setUploading(true); setError('')
    const form = new FormData()
    form.append('avatar', file)
    const response = await fetch('/api/profile/avatar', { method: 'POST', body: form })
    const result = await response.json()
    setUploading(false)
    if (!response.ok) { setError(result.error || 'Unable to upload photo'); return }
    setAvatar(result.url)
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaved(false); setError(''); setSaving(true)
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: form.get('fullName'), phone: form.get('phone'), dateOfBirth: form.get('dateOfBirth'), jambRegistrationNumber: form.get('jambRegistrationNumber'), stateOfResidence: form.get('stateOfResidence') }) })
    const result = await response.json()
    setSaving(false)
    if (!response.ok) { setError(result.error || 'Unable to save profile'); return }
    setSaved(true); window.setTimeout(() => setSaved(false), 2500)
  }
  return <form onSubmit={save} className="profile-grid"><aside className="adm-card profile-card"><div className="large-avatar">{avatar ? <img src={avatar} alt="Profile photo" className="h-full w-full object-cover" /> : <UserRound />}<input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadAvatar(file); e.target.value = '' }} /><button type="button" aria-label="Change profile photo" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? <span className="spinner" /> : <Camera />}</button></div><h2>{profile.full_name}</h2><p>Student applicant</p><span className="profile-id">{profile.application_number || 'Application ID pending'}</span><div className="profile-contact"><span><Mail />{user.email}</span>{profile.phone && <span><Phone />{profile.phone}</span>}</div><div className="settings-list profile-logout-list"><LogoutButton /></div></aside><section className="adm-card profile-form"><h2>Personal information</h2><div className="form-grid"><label>Full name<input name="fullName" defaultValue={profile.full_name} required /></label><label>Email address<input type="email" value={user.email} readOnly /></label><label>Phone number<input name="phone" type="tel" defaultValue={profile.phone || ''} /></label><label>Date of birth<input name="dateOfBirth" type="date" defaultValue={profile.date_of_birth || ''} /></label><label>State of residence<input name="stateOfResidence" defaultValue={application?.state_of_residence || ''} /></label></div><h2 className="form-section-title">Application information</h2><div className="form-grid"><label>JAMB registration number<input name="jambRegistrationNumber" defaultValue={application?.jamb_registration_number || ''} /></label></div><div className="form-actions">{error && <span className="text-sm text-rose-700">{error}</span>}{saved && <span className="save-success"><Check />Changes saved</span>}<button className="adm-button button-primary" type="submit" disabled={saving}>{saving ? <><span className="spinner" />Saving…</> : 'Save changes'}</button></div></section></form>
}
