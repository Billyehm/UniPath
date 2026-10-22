import { createClient } from '@/lib/supabase/server'
import type { ActivityItem, AdminRequirement, DashboardSummary, DocumentReviewItem, StaffChatMessage, StaffDirectoryItem, StudentDetail, StudentDirectoryItem, SupportMessage, SupportTicket } from '@/lib/models'

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient()
  const [users, applications, documents, pending, tickets] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('uploaded_documents').select('*', { count: 'exact', head: true }),
    supabase.from('uploaded_documents').select('*', { count: 'exact', head: true }).eq('review_status', 'pending'),
    supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ])

  return {
    totalUsers: users.count ?? 0,
    totalApplications: applications.count ?? 0,
    totalDocuments: documents.count ?? 0,
    pendingReviews: pending.count ?? 0,
    openTickets: tickets.count ?? 0,
  }
}

export async function getRecentActivity(limit = 8): Promise<ActivityItem[]> {
  const supabase = await createClient()
  const { data: logs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit)
  if (!logs?.length) return []

  const actorIds = [...new Set(logs.flatMap((log) => log.actor_user_id ? [log.actor_user_id] : []))]
  const { data: profiles } = actorIds.length
    ? await supabase.from('user_profiles').select('user_id,full_name').in('user_id', actorIds)
    : { data: [] }
  const names = new Map((profiles ?? []).map((profile) => [profile.user_id, profile.full_name]))

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    actorName: log.actor_user_id ? names.get(log.actor_user_id) || 'Team member' : 'System',
    createdAt: log.created_at,
  }))
}

export async function getSupportTickets(assignedTo?: string): Promise<SupportTicket[]> {
  const supabase = await createClient()
  let query = supabase.from('support_tickets').select('*').order('updated_at', { ascending: false })
  if (assignedTo) query = query.eq('assigned_to', assignedTo)
  const { data: tickets, error } = await query
  if (error) throw error
  if (!tickets?.length) return []

  const ticketIds = tickets.map((ticket) => ticket.id)
  const userIds = [...new Set(tickets.map((ticket) => ticket.user_id))]
  const [{ data: messages }, { data: profiles }, { data: users }, { data: admins }] = await Promise.all([
    supabase.from('support_messages').select('*').in('ticket_id', ticketIds).order('created_at'),
    supabase.from('user_profiles').select('user_id,full_name').in('user_id', userIds),
    supabase.from('users').select('id,email').in('id', userIds),
    supabase.from('admin_users').select('user_id,display_name'),
  ])

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id, profile.full_name]))
  const emailMap = new Map((users ?? []).map((user) => [user.id, user.email]))
  const adminMap = new Map((admins ?? []).map((admin) => [admin.user_id, admin.display_name]))
  const messageMap = new Map<string, SupportMessage[]>()

  for (const message of messages ?? []) {
    const staffName = adminMap.get(message.sender_user_id)
    const item: SupportMessage = {
      id: message.id,
      body: message.body,
      senderUserId: message.sender_user_id,
      senderName: staffName || profileMap.get(message.sender_user_id) || emailMap.get(message.sender_user_id) || 'Applicant',
      isStaff: Boolean(staffName),
      isInternal: message.is_internal,
      createdAt: message.created_at,
    }
    messageMap.set(message.ticket_id, [...(messageMap.get(message.ticket_id) ?? []), item])
  }

  return tickets.map((ticket) => ({
    id: ticket.id,
    applicantId: ticket.user_id,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    applicantName: profileMap.get(ticket.user_id) || 'Applicant',
    applicantEmail: emailMap.get(ticket.user_id) || '',
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    messages: messageMap.get(ticket.id) ?? [],
  }))
}

export async function getStudents(): Promise<StudentDirectoryItem[]> {
  const supabase = await createClient()
  const { data: users, error } = await supabase.from('users').select('*').eq('role', 'applicant').order('created_at', { ascending: false })
  if (error) throw error
  if (!users?.length) return []
  const ids = users.map((user) => user.id)
  const [{ data: profiles }, { data: documents }, { data: tickets }, { data: applications }] = await Promise.all([
    supabase.from('user_profiles').select('user_id,full_name,application_number').in('user_id', ids),
    supabase.from('uploaded_documents').select('user_id').in('user_id', ids),
    supabase.from('support_tickets').select('user_id,status').in('user_id', ids),
    supabase.from('applications').select('user_id,status').in('user_id', ids),
  ])
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]))
  return users.map((user) => ({
    id: user.id,
    name: profileMap.get(user.id)?.full_name || 'Applicant',
    email: user.email,
    applicationNumber: profileMap.get(user.id)?.application_number ?? null,
    active: user.is_active,
    joinedAt: user.created_at,
    documents: (documents ?? []).filter((item) => item.user_id === user.id).length,
    openTickets: (tickets ?? []).filter((item) => item.user_id === user.id && item.status !== 'resolved').length,
    applicationStatus: (applications ?? []).find((item) => item.user_id === user.id)?.status ?? null,
  }))
}

export async function getAdminRequirements(): Promise<AdminRequirement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('requirements').select('*').order('display_order')
  if (error) throw error
  return (data ?? []).map((item) => ({ id: item.id, title: item.title, subtitle: item.description, guidance: item.guidance, submissionType: item.submission_type, amountKobo: item.amount_kobo ?? null, displayOrder: item.display_order, isActive: item.is_active }))
}

export async function getStaff(): Promise<StaffDirectoryItem[]> {
  const supabase = await createClient()
  const { data: staff, error } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false })
  if (error) throw error
  if (!staff?.length) return []
  const ids = staff.map((item) => item.user_id)
  const roleIds = [...new Set(staff.map((item) => item.role_id))]
  const [{ data: users }, { data: roles }] = await Promise.all([
    supabase.from('users').select('id,email').in('id', ids),
    supabase.from('roles').select('id,name').in('id', roleIds),
  ])
  const emailMap = new Map((users ?? []).map((user) => [user.id, user.email]))
  const roleMap = new Map((roles ?? []).map((role) => [role.id, role.name]))
  return staff.map((item) => ({
    id: item.user_id,
    name: item.display_name,
    email: emailMap.get(item.user_id) || '',
    role: roleMap.get(item.role_id) === 'admin' ? 'admin' : 'support_agent',
    active: item.is_active,
    joinedAt: item.created_at,
  }))
}

export async function getDocumentsForReview(userId?: string): Promise<DocumentReviewItem[]> {
  const supabase = await createClient()
  let query = supabase.from('uploaded_documents').select('*').order('submitted_at', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  const { data: documents, error } = await query
  if (error) throw error
  if (!documents?.length) return []

  const userIds = [...new Set(documents.map((document) => document.user_id))]
  const documentIds = documents.map((document) => document.id)
  const [{ data: profiles }, { data: users }, { data: reviews }, { data: requirementDefinitions }, { data: requirementStates }] = await Promise.all([
    supabase.from('user_profiles').select('user_id,full_name').in('user_id', userIds),
    supabase.from('users').select('id,email').in('id', userIds),
    supabase.from('document_reviews').select('document_id,internal_notes,created_at').in('document_id', documentIds).order('created_at', { ascending: false }),
    supabase.from('requirements').select('id,title'),
    supabase.from('user_requirements').select('id,user_id,requirement_id,response_text,updated_at,status').in('user_id', userIds).not('response_text', 'is', null),
  ])

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id, profile.full_name]))
  const emailMap = new Map((users ?? []).map((user) => [user.id, user.email]))
  const reviewMap = new Map<string, string | null>()
  for (const review of reviews ?? []) if (!reviewMap.has(review.document_id)) reviewMap.set(review.document_id, review.internal_notes)

  const requirementMap = new Map((requirementDefinitions ?? []).map((item) => [item.id, item]))
  const responseByDocument = new Map<string, string>()
  const responseDocumentIds = new Set<string>()
  for (const state of requirementStates ?? []) {
    const definition = requirementMap.get(state.requirement_id)
    const matchingDocument = definition ? documents.find((document) => document.user_id === state.user_id && document.document_type.toLowerCase() === definition.title.toLowerCase()) : null
    if (matchingDocument) { responseByDocument.set(matchingDocument.id, state.response_text!); responseDocumentIds.add(state.id) }
  }
  const fileItems = await Promise.all(documents.map(async (document) => {
    const { data } = await supabase.storage.from('applicant-documents').createSignedUrl(document.storage_path, 300)
    return {
      id: document.id,
      kind: 'file' as const,
      userId: document.user_id,
      applicantName: profileMap.get(document.user_id) || 'Applicant',
      applicantEmail: emailMap.get(document.user_id) || '',
      documentType: document.document_type,
      originalName: document.original_name,
      mimeType: document.mime_type,
      sizeBytes: document.size_bytes,
      reviewStatus: document.review_status,
      submittedAt: document.submitted_at,
      previewUrl: data?.signedUrl ?? null,
      latestInternalNote: reviewMap.get(document.id) ?? null,
      writtenResponse: responseByDocument.get(document.id) ?? null,
    }
  }))
  const textItems: DocumentReviewItem[] = (requirementStates ?? []).filter((state) => !responseDocumentIds.has(state.id)).map((state) => {
    const definition = requirementMap.get(state.requirement_id)
    return { id: `text-${state.id}`, kind: 'text', userId: state.user_id, applicantName: profileMap.get(state.user_id) || 'Applicant', applicantEmail: emailMap.get(state.user_id) || '', documentType: definition?.title || 'Written response', originalName: definition?.title || 'Written response', mimeType: 'text/plain', sizeBytes: state.response_text!.length, reviewStatus: 'pending', submittedAt: state.updated_at, previewUrl: null, latestInternalNote: null, writtenResponse: state.response_text }
  })
  return [...fileItems, ...textItems]
}

export async function getStudentDetail(userId: string): Promise<StudentDetail | null> {
  const supabase = await createClient()
  const { data: user, error } = await supabase.from('users').select('*').eq('id', userId).eq('role', 'applicant').maybeSingle()
  if (error) throw error
  if (!user) return null

  const [{ data: profile }, { data: application }, documents, { data: selections }, { data: universities }, { data: tickets }] = await Promise.all([
    supabase.from('user_profiles').select('full_name,application_number').eq('user_id', userId).maybeSingle(),
    supabase.from('applications').select('status,payment_status').eq('user_id', userId).maybeSingle(),
    getDocumentsForReview(userId),
    supabase.from('university_selections').select('university_id').eq('user_id', userId),
    supabase.from('universities').select('id,name'),
    supabase.from('support_tickets').select('status').eq('user_id', userId),
  ])
  const universityMap = new Map((universities ?? []).map((university) => [university.id, university.name]))
  return {
    id: user.id,
    name: profile?.full_name || 'Applicant',
    email: user.email,
    applicationNumber: profile?.application_number ?? null,
    active: user.is_active,
    joinedAt: user.created_at,
    documents: documents.length,
    openTickets: (tickets ?? []).filter((ticket) => ticket.status !== 'resolved').length,
    applicationStatus: application?.status ?? null,
    paymentStatus: application?.payment_status ?? null,
    documentsForReview: documents,
    selectedUniversities: (selections ?? []).map((selection) => universityMap.get(selection.university_id)).filter((name): name is string => Boolean(name)),
  }
}

export async function getStaffChatMessages(): Promise<StaffChatMessage[]> {
  const supabase = await createClient()
  const { data: messages, error } = await supabase.from('staff_messages').select('*').order('created_at')
  if (error) throw error
  if (!messages?.length) return []
  const messageIds = messages.map((message) => message.id)
  const [{ data: staff }, { data: versions }] = await Promise.all([
    supabase.from('admin_users').select('user_id,display_name'),
    supabase.from('staff_message_versions').select('*').in('message_id', messageIds).order('version', { ascending: false }),
  ])
  const nameMap = new Map((staff ?? []).map((member) => [member.user_id, member.display_name]))
  const messageMap = new Map(messages.map((message) => [message.id, message]))
  const versionsByMessage = new Map<string, StaffChatMessage['versions']>()
  for (const version of versions ?? []) versionsByMessage.set(version.message_id, [...(versionsByMessage.get(version.message_id) ?? []), { id: version.id, body: version.body, version: version.version, createdAt: version.created_at }])
  return messages.map((message) => {
    const reply = message.reply_to_id ? messageMap.get(message.reply_to_id) : null
    return {
      id: message.id,
      senderId: message.sender_id,
      senderName: nameMap.get(message.sender_id) || 'Staff member',
      body: message.body,
      replyToId: message.reply_to_id,
      replyToName: reply ? nameMap.get(reply.sender_id) || 'Staff member' : null,
      replyToBody: reply?.body ?? null,
      createdAt: message.created_at,
      editedAt: message.edited_at,
      versions: versionsByMessage.get(message.id) ?? [],
    }
  })
}
