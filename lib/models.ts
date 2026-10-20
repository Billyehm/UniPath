import type { RequirementStatus, ReviewStatus, TicketPriority, TicketStatus, UpdateCategory } from '@/lib/database.types'

export type Requirement = {
  id: string
  title: string
  description: string
  guidance: string | null
  accepted: string | null
  submissionType: 'file' | 'text' | 'both'
  responseText: string | null
  status: RequirementStatus
  note: string | null
  updatedAt: string
  document: { id: string; name: string; status: ReviewStatus; previewUrl?: string | null } | null
}

export type University = {
  id: string
  name: string
  shortName: string
  location: string
  description: string
  programmes: string
  deadline: string | null
  selected: boolean
  latestUpdate: string | null
}

export type InstitutionType = 'university' | 'polytechnic' | 'college_of_education'

export type Institution = {
  id: string
  name: string
  type: InstitutionType
  ownership: 'federal' | 'state' | 'private'
  state: string
  yearEstablished: number | null
  website: string | null
}

export type InstitutionCourse = {
  id: string
  courseName: string
  qualification: string
  durationYears: number | null
  faculty: string | null
  source: 'listed' | 'inferred'
}

export type UniversityUpdate = {
  id: string
  universityId: string | null
  university: string
  title: string
  description: string
  category: UpdateCategory
  publishedAt: string
  selected: boolean
}

export type DashboardSummary = {
  totalUsers: number
  totalApplications: number
  totalDocuments: number
  pendingReviews: number
  openTickets: number
}

export type ActivityItem = {
  id: number
  action: string
  entityType: string
  entityId: string | null
  actorName: string
  createdAt: string
}

export type SupportMessage = {
  id: string
  body: string
  senderUserId: string
  senderName: string
  isStaff: boolean
  isInternal: boolean
  createdAt: string
}

export type SupportTicket = {
  id: string
  applicantId: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  applicantName: string
  applicantEmail: string
  createdAt: string
  updatedAt: string
  messages: SupportMessage[]
}

export type DocumentReviewItem = {
  id: string
  kind: 'file' | 'text'
  userId: string
  applicantName: string
  applicantEmail: string
  documentType: string
  originalName: string
  mimeType: string
  sizeBytes: number
  reviewStatus: ReviewStatus
  submittedAt: string
  previewUrl: string | null
  latestInternalNote: string | null
  writtenResponse: string | null
}

export type StudentDirectoryItem = {
  id: string
  name: string
  email: string
  applicationNumber: string | null
  active: boolean
  joinedAt: string
  documents: number
  openTickets: number
  applicationStatus: string | null
}

export type AdminRequirement = {
  id: string
  title: string
  subtitle: string
  guidance: string | null
  submissionType: 'file' | 'text' | 'both'
  displayOrder: number
  isActive: boolean
}

export type StudentDetail = StudentDirectoryItem & {
  applicationStatus: string | null
  paymentStatus: string | null
  documentsForReview: DocumentReviewItem[]
  selectedUniversities: string[]
}

export type StaffDirectoryItem = {
  id: string
  name: string
  email: string
  role: 'admin' | 'support_agent'
  active: boolean
  joinedAt: string
}

export type StaffMessageVersion = {
  id: number
  body: string
  version: number
  createdAt: string
}

export type StaffChatMessage = {
  id: string
  senderId: string
  senderName: string
  body: string
  replyToId: string | null
  replyToName: string | null
  replyToBody: string | null
  createdAt: string
  editedAt: string | null
  versions: StaffMessageVersion[]
}
