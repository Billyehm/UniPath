import { z } from 'zod'

export const createTicketSchema = z.object({
  subject: z.string().trim().min(4).max(160),
  message: z.string().trim().min(1).max(5000),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
})

export const replyToTicketSchema = z.object({
  message: z.string().trim().min(1).max(5000),
  status: z.enum(['open', 'pending', 'resolved']).optional(),
  internal: z.boolean().default(false),
})

export const reviewDocumentSchema = z.object({
  status: z.enum(['approved', 'rejected', 'resubmission_requested']),
  internalNotes: z.string().trim().max(3000).optional().default(''),
  applicantMessage: z.string().trim().max(3000).optional().default(''),
})

export const uploadDocumentSchema = z.object({
  documentType: z.string().trim().min(2).max(100),
  file: z.instanceof(File).refine((file) => file.size > 0, 'A file is required').refine(
    (file) => file.size <= 10 * 1024 * 1024,
    'Files must be 10 MB or smaller',
  ).refine(
    (file) => ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Only PDF, JPG, PNG and WebP files are supported',
  ),
})

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30).optional().default(''),
  dateOfBirth: z.string().date().optional().or(z.literal('')),
  jambRegistrationNumber: z.string().trim().max(40).optional().default(''),
  stateOfResidence: z.string().trim().max(80).optional().default(''),
})

export const notificationReadSchema = z.object({ ids: z.array(z.string().uuid()).optional() })
export const notificationPreferencesSchema = z.object({ preferences: z.record(z.string(), z.object({ sms: z.boolean(), email: z.boolean() })) })
export const createUniversityUpdateSchema = z.object({
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(1).max(2000),
  category: z.enum(['general', 'important', 'deadline']).default('general'),
  universityId: z.string().trim().min(1).nullable().optional().default(null),
})
export const staffMessageSchema = z.object({ body: z.string().trim().min(1).max(5000), replyToId: z.string().uuid().nullable().optional().default(null) })
export const editStaffMessageSchema = z.object({ body: z.string().trim().min(1).max(5000) })
export const requirementSchema = z.object({
  title: z.string().trim().min(2).max(140),
  subtitle: z.string().trim().min(2).max(500),
  guidance: z.string().trim().max(4000).nullable().optional().default(null),
  submissionType: z.enum(['file', 'text', 'both', 'payment']),
  amountKobo: z.number().int().positive().max(10000000000).nullable().optional().default(null),
}).refine((data) => data.submissionType !== 'payment' || data.amountKobo, {
  message: 'Payment steps need an amount.',
  path: ['amountKobo'],
})
export const requirementTextSchema = z.object({ text: z.string().trim().min(1).max(5000) })

export function zodErrorMessage(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join(', ')
}
