import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.')

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
const password = 'UniPathSeed!2026'
const staff = [
  { email: 'admin@unipath.test', name: 'Ada Admin', role: 'admin' },
  { email: 'founder@unipath.test', name: 'Femi Founder', role: 'admin' },
  { email: 'support@unipath.test', name: 'Ifeoma Support', role: 'support_agent' },
] as const
const applicantNames = ['William Okafor', 'Amara Eze', 'David Bello', 'Zainab Musa', 'Tobi Adeyemi', 'Chioma Nwosu', 'Samuel Okon', 'Amina Yusuf', 'Daniel Obi', 'Grace Lawal']
const applicants = applicantNames.map((name, index) => ({ email: `applicant${index + 1}@unipath.test`, name, role: 'applicant' as const }))
const requirements = [
  { id: 'utme-result-slip', title: 'JAMB Registration Number & UTME Result Slip', description: 'Upload your JAMB registration number and UTME result slip.', guidance: 'Use a clear copy that shows your registration number, name and UTME result.', accepted_files: 'PDF, PNG or JPEG up to 10 MB', display_order: 1 },
  { id: 'olevel-results', title: 'O’Level Result(s)', description: 'Submit WAEC, NECO or NABTEB result(s). A maximum of two sittings is accepted, with five credits including English and Mathematics.', guidance: 'Upload every result used for your screening application. Make all subjects and grades readable.', accepted_files: 'PDF, PNG or JPEG up to 10 MB', display_order: 2 },
  { id: 'jamb-caps-olevel-upload', title: 'JAMB CAPS O’Level Upload', description: 'Provide evidence that your O’Level result has been uploaded directly to your JAMB CAPS profile.', guidance: 'Upload a clear JAMB CAPS screenshot or confirmation slip showing the O’Level upload.', accepted_files: 'PDF, PNG or JPEG up to 10 MB', display_order: 3 },
  { id: 'passport-red-background', title: 'Recent Passport Photograph', description: 'Submit a clear recent passport photograph on a red background.', guidance: 'Your face must be clearly visible, centred and unobstructed.', accepted_files: 'PNG or JPEG up to 10 MB', display_order: 4 },
  { id: 'active-contact-details', title: 'Active Email Address & Phone Number', description: 'Confirm the active email address and phone number used for your application.', guidance: 'Upload a clear confirmation document or screenshot containing the contact details you will use for screening updates.', accepted_files: 'PDF, PNG or JPEG up to 10 MB', display_order: 5 },
  { id: 'uniuyo-screening-slip', title: 'UNIUYO Screening Exercise Slip', description: 'Pay the ₦2,000 screening fee through Remita, then upload your completed UNIUYO Screening Exercise Slip.', guidance: 'Upload the completed screening exercise slip after payment. Keep your Remita payment record for your reference.', accepted_files: 'PDF, PNG or JPEG up to 10 MB', display_order: 6 },
] as const
const universities = [
  { id: 'unilag', name: 'University of Lagos', short_name: 'UNILAG', location: 'Lagos, Nigeria', description: 'A leading public research university with a broad range of undergraduate programmes.', programmes: 'Engineering, Law, Medicine, Business, Arts', application_deadline: '2026-10-31' },
  { id: 'ui', name: 'University of Ibadan', short_name: 'UI', location: 'Ibadan, Nigeria', description: 'Nigeria’s oldest degree-awarding institution, known for research and academic excellence.', programmes: 'Medicine, Sciences, Agriculture, Arts, Social Sciences', application_deadline: '2026-11-07' },
  { id: 'covenant', name: 'Covenant University', short_name: 'CU', location: 'Ota, Nigeria', description: 'A private university focused on leadership, innovation and entrepreneurship.', programmes: 'Engineering, Computing, Business, Social Sciences', application_deadline: '2026-10-24' },
  { id: 'unn', name: 'University of Nigeria, Nsukka', short_name: 'UNN', location: 'Nsukka, Nigeria', description: 'A comprehensive federal university offering programmes across the sciences and humanities.', programmes: 'Engineering, Medicine, Education, Arts, Agriculture', application_deadline: '2026-11-14' },
] as const

async function ensureAuthUser(email: string, name: string) {
  const { data: existing } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const found = existing.users.find((user) => user.email === email)
  if (found) return found.id
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } })
  if (error) throw error
  return data.user.id
}

async function main() {
const { error: requirementsError } = await supabase.from('requirements').upsert(requirements)
if (requirementsError) throw requirementsError
const { error: universitiesError } = await supabase.from('universities').upsert(universities)
if (universitiesError) throw universitiesError

const userIds = new Map<string, string>()
for (const person of [...staff, ...applicants]) {
  const id = await ensureAuthUser(person.email, person.name)
  userIds.set(person.email, id)
  const applicationNumber = person.role === 'applicant' ? `ADM-2026-${String(1040 + applicants.findIndex((item) => item.email === person.email)).padStart(4, '0')}` : null
  const { error: userError } = await supabase.from('users').update({ role: person.role }).eq('id', id)
  if (userError) throw userError
  const { error: profileError } = await supabase.from('user_profiles').upsert({ user_id: id, full_name: person.name, application_number: applicationNumber })
  if (profileError) throw profileError
}

const applicationRows = applicants.map((applicant, index) => ({
  user_id: userIds.get(applicant.email)!,
  status: (['in_progress', 'ready_for_review', 'processing', 'completed'] as const)[index % 4],
  payment_status: (['not_due', 'due', 'paid'] as const)[index % 3],
  payment_amount: index % 3 === 1 ? 25000 : null,
  jamb_registration_number: `2026${String(81000000 + index)}`,
  state_of_residence: ['Lagos', 'Enugu', 'Kano', 'Oyo'][index % 4],
}))
const { error: applicationError } = await supabase.from('applications').upsert(applicationRows, { onConflict: 'user_id' })
if (applicationError) throw applicationError

const preferenceRows = applicants.map((applicant) => ({ user_id: userIds.get(applicant.email)! }))
const { error: preferenceError } = await supabase.from('notification_preferences').upsert(preferenceRows, { onConflict: 'user_id' })
if (preferenceError) throw preferenceError

const { data: roles, error: roleError } = await supabase.from('roles').select('id,name')
if (roleError) throw roleError
for (const person of staff) {
  const roleId = roles?.find((role) => role.name === person.role)?.id
  if (!roleId) throw new Error(`Role ${person.role} is missing. Apply migrations first.`)
  const { error } = await supabase.from('admin_users').upsert({ user_id: userIds.get(person.email)!, role_id: roleId, display_name: person.name, is_active: true })
  if (error) throw error
}

const statuses = ['open', 'pending', 'resolved'] as const
const priorities = ['normal', 'high', 'low', 'urgent'] as const
const ticketRows = Array.from({ length: 20 }, (_, index) => ({
  id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  user_id: userIds.get(applicants[index % applicants.length].email)!,
  subject: ['Document upload question', 'Application status update', 'Passport photo guidance', 'JAMB profile help'][index % 4],
  status: statuses[index % statuses.length],
  priority: priorities[index % priorities.length],
  assigned_to: userIds.get(staff[2].email)!,
}))
const { error: ticketError } = await supabase.from('support_tickets').upsert(ticketRows)
if (ticketError) throw ticketError

const messageRows = ticketRows.flatMap((ticket, index) => [
  { id: `30000000-0000-4000-8000-${String(index * 2 + 1).padStart(12, '0')}`, ticket_id: ticket.id, sender_user_id: ticket.user_id, body: 'Please help me understand what I need to do next.', is_internal: false },
  { id: `30000000-0000-4000-8000-${String(index * 2 + 2).padStart(12, '0')}`, ticket_id: ticket.id, sender_user_id: userIds.get(staff[2].email)!, body: 'Thanks for contacting UniPath. We have reviewed your request and added the next step here.', is_internal: false },
])
const { error: messageError } = await supabase.from('support_messages').upsert(messageRows)
if (messageError) throw messageError

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF')
const reviewStates = ['pending', 'approved', 'rejected', 'resubmission_requested'] as const
const documentTypes = ['WAEC Result', 'JAMB Profile', 'Passport Photograph']
const documentRows: Array<{
  id: string
  user_id: string
  document_type: string
  original_name: string
  storage_path: string
  mime_type: string
  size_bytes: number
  review_status: typeof reviewStates[number]
}> = []
for (let index = 0; index < 15; index++) {
  const applicant = applicants[index % applicants.length]
  const ownerId = userIds.get(applicant.email)!
  const isImage = index % 3 === 2
  const extension = isImage ? 'png' : 'pdf'
  const path = `${ownerId}/seed/seed-document-${index + 1}.${extension}`
  const { error: storageError } = await supabase.storage.from('applicant-documents').upload(path, isImage ? png : pdf, { contentType: isImage ? 'image/png' : 'application/pdf', upsert: true })
  if (storageError) throw storageError
  documentRows.push({
    id: `20000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    user_id: ownerId,
    document_type: documentTypes[index % documentTypes.length],
    original_name: `seed-document-${index + 1}.${extension}`,
    storage_path: path,
    mime_type: isImage ? 'image/png' : 'application/pdf',
    size_bytes: isImage ? png.byteLength : pdf.byteLength,
    review_status: reviewStates[index % reviewStates.length],
  })
}
const { error: documentError } = await supabase.from('uploaded_documents').upsert(documentRows)
if (documentError) throw documentError

const documentRequirement = new Map([
  ['WAEC Result', 'olevel-results'],
  ['JAMB Profile', 'utme-result-slip'],
  ['Passport Photograph', 'passport-red-background'],
])
const requirementRows = applicants.flatMap((applicant, applicantIndex) => {
  const ownerId = userIds.get(applicant.email)!
  return requirements.map((requirement) => {
    const document = documentRows.find((item) => item.user_id === ownerId && documentRequirement.get(item.document_type) === requirement.id)
    const documentStatus = document?.review_status
    const status = documentStatus === 'approved'
      ? 'completed'
      : documentStatus === 'rejected' || documentStatus === 'resubmission_requested'
        ? 'action_needed'
        : documentStatus === 'pending'
          ? 'processing'
          : requirement.id === 'active-contact-details' && applicantIndex < 8
            ? 'completed'
            : 'not_started'
    return { user_id: ownerId, requirement_id: requirement.id, status, document_id: document?.id ?? null }
  })
})
const { error: userRequirementError } = await supabase.from('user_requirements').upsert(requirementRows, { onConflict: 'user_id,requirement_id' })
if (userRequirementError) throw userRequirementError

const selectionRows = applicants.slice(0, 6).flatMap((applicant, index) => [
  { user_id: userIds.get(applicant.email)!, university_id: universities[index % universities.length].id },
  { user_id: userIds.get(applicant.email)!, university_id: universities[(index + 1) % universities.length].id },
])
const { error: selectionError } = await supabase.from('university_selections').upsert(selectionRows)
if (selectionError) throw selectionError

const updateRows = universities.map((university, index) => ({
  id: `40000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  university_id: university.id,
  title: index % 2 === 0 ? 'Application review timeline updated' : 'Admission document guidance published',
  description: index % 2 === 0 ? `${university.short_name} has published its latest application review timeline.` : `${university.short_name} has clarified the documents applicants should prepare.`,
  category: index === 0 ? 'deadline' : index === 1 ? 'important' : 'general',
}))
const { error: updateError } = await supabase.from('university_updates').upsert(updateRows)
if (updateError) throw updateError

const notificationRows = applicants.flatMap((applicant, applicantIndex) => [
  { id: `50000000-0000-4000-8000-${String(applicantIndex * 2 + 1).padStart(12, '0')}`, user_id: userIds.get(applicant.email)!, type: 'application', title: 'Application progress updated', body: 'Your application record is ready for your next review.', href: '/dashboard' },
  { id: `50000000-0000-4000-8000-${String(applicantIndex * 2 + 2).padStart(12, '0')}`, user_id: userIds.get(applicant.email)!, type: 'deadline', title: 'Check upcoming deadlines', body: 'Review the latest dates for your selected universities.', href: '/dashboard/updates' },
])
const { error: notificationError } = await supabase.from('notifications').upsert(notificationRows)
if (notificationError) throw notificationError

const { error: noticeError } = await supabase.from('system_notices').upsert({
  id: '60000000-0000-4000-8000-000000000001',
  title: 'Application review is active',
  body: 'Keep your documents current so the UniPath team can complete your review without delay.',
  is_active: true,
})
if (noticeError) throw noticeError

const auditRows = ticketRows.slice(0, 8).map((ticket, index) => ({ actor_user_id: userIds.get(staff[index % staff.length].email)!, action: index % 2 ? 'support_ticket.replied' : 'support_ticket.assigned', entity_type: 'support_ticket', entity_id: ticket.id, metadata: { seeded: true } }))
const { error: auditError } = await supabase.from('audit_logs').insert(auditRows)
if (auditError) throw auditError

console.log(`Seeded ${staff.length} staff, ${applicants.length} applicants, ${ticketRows.length} tickets, ${documentRows.length} documents and all dashboard reference data.`)
console.log(`Seed password: ${password}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
