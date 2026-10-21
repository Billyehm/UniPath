import Link from 'next/link'
import { Bell, ChevronRight, CreditCard, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'

export default function SettingsPage() {
  return <div className="page-stack narrow-page"><section className="page-intro"><div><p className="eyebrow-dark">Account settings</p><h2>Simple controls for your account.</h2></div></section><section className="adm-card settings-list"><Link href="/dashboard/profile"><span><UserRound /></span><div><strong>Personal information</strong></div><ChevronRight /></Link><Link href="/dashboard/notifications"><span><Bell /></span><div><strong>Notification preferences</strong></div><ChevronRight /></Link><Link href="/dashboard/payment"><span><CreditCard /></span><div><strong>Application payment</strong></div><ChevronRight /></Link><button><span><LockKeyhole /></span><div><strong>Password and security</strong></div><ChevronRight /></button><button><span><ShieldCheck /></span><div><strong>Privacy and data</strong></div><ChevronRight /></button></section></div>
}
