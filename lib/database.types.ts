export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type AppRole = 'admin' | 'support_agent' | 'applicant'
export type TicketStatus = 'open' | 'pending' | 'resolved'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'resubmission_requested'
export type ApplicationStatus = 'draft' | 'in_progress' | 'ready_for_review' | 'processing' | 'completed'
export type RequirementStatus = 'not_started' | 'processing' | 'action_needed' | 'completed'
export type UpdateCategory = 'important' | 'deadline' | 'general'
export type PaymentStatus = 'not_due' | 'due' | 'paid'

type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: { id: number; name: AppRole; description: string; created_at: string }
        Insert: { id?: number; name: AppRole; description: string; created_at?: string }
        Update: { name?: AppRole; description?: string }
        Relationships: []
      }
      users: {
        Row: { id: string; email: string; role: AppRole; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id: string; email: string; role?: AppRole; is_active?: boolean; created_at?: string; updated_at?: string }
        Update: { email?: string; role?: AppRole; is_active?: boolean; updated_at?: string }
        Relationships: []
      }
      user_profiles: {
        Row: { user_id: string; full_name: string; phone: string | null; application_number: string | null; date_of_birth: string | null; avatar_path: string | null; created_at: string; updated_at: string }
        Insert: { user_id: string; full_name?: string; phone?: string | null; application_number?: string | null; date_of_birth?: string | null; avatar_path?: string | null }
        Update: { full_name?: string; phone?: string | null; application_number?: string | null; date_of_birth?: string | null; avatar_path?: string | null }
        Relationships: Relationship[]
      }
      admin_users: {
        Row: { user_id: string; role_id: number; display_name: string; is_active: boolean; created_at: string; updated_at: string }
        Insert: { user_id: string; role_id: number; display_name: string; is_active?: boolean }
        Update: { role_id?: number; display_name?: string; is_active?: boolean }
        Relationships: Relationship[]
      }
      uploaded_documents: {
        Row: { id: string; user_id: string; document_type: string; original_name: string; storage_path: string; mime_type: string; size_bytes: number; review_status: ReviewStatus; submitted_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; document_type: string; original_name: string; storage_path: string; mime_type: string; size_bytes: number; review_status?: ReviewStatus }
        Update: { document_type?: string; original_name?: string; storage_path?: string; mime_type?: string; size_bytes?: number; review_status?: ReviewStatus }
        Relationships: Relationship[]
      }
      document_reviews: {
        Row: { id: string; document_id: string; reviewer_id: string; status: ReviewStatus; internal_notes: string | null; applicant_message: string | null; created_at: string }
        Insert: { id?: string; document_id: string; reviewer_id: string; status: ReviewStatus; internal_notes?: string | null; applicant_message?: string | null }
        Update: { status?: ReviewStatus; internal_notes?: string | null; applicant_message?: string | null }
        Relationships: Relationship[]
      }
      support_tickets: {
        Row: { id: string; user_id: string; subject: string; status: TicketStatus; priority: TicketPriority; assigned_to: string | null; created_at: string; updated_at: string; resolved_at: string | null }
        Insert: { id?: string; user_id: string; subject: string; status?: TicketStatus; priority?: TicketPriority; assigned_to?: string | null; resolved_at?: string | null }
        Update: { subject?: string; status?: TicketStatus; priority?: TicketPriority; assigned_to?: string | null; resolved_at?: string | null }
        Relationships: Relationship[]
      }
      support_messages: {
        Row: { id: string; ticket_id: string; sender_user_id: string; body: string; is_internal: boolean; created_at: string }
        Insert: { id?: string; ticket_id: string; sender_user_id: string; body: string; is_internal?: boolean }
        Update: { body?: string; is_internal?: boolean }
        Relationships: Relationship[]
      }
      audit_logs: {
        Row: { id: number; actor_user_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Json; created_at: string }
        Insert: { actor_user_id?: string | null; action: string; entity_type: string; entity_id?: string | null; metadata?: Json }
        Update: never
        Relationships: Relationship[]
      }
      applications: {
        Row: { id: string; user_id: string; status: ApplicationStatus; payment_status: PaymentStatus; payment_amount: number | null; jamb_registration_number: string | null; state_of_residence: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; status?: ApplicationStatus; payment_status?: PaymentStatus; payment_amount?: number | null; jamb_registration_number?: string | null; state_of_residence?: string | null }
        Update: { status?: ApplicationStatus; payment_status?: PaymentStatus; payment_amount?: number | null; jamb_registration_number?: string | null; state_of_residence?: string | null }
        Relationships: Relationship[]
      }
      requirements: {
        Row: { id: string; title: string; description: string; guidance: string | null; accepted_files: string | null; submission_type: 'file' | 'text' | 'both'; display_order: number; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id: string; title: string; description: string; guidance?: string | null; accepted_files?: string | null; submission_type?: 'file' | 'text' | 'both'; display_order?: number; is_active?: boolean }
        Update: { title?: string; description?: string; guidance?: string | null; accepted_files?: string | null; submission_type?: 'file' | 'text' | 'both'; display_order?: number; is_active?: boolean }
        Relationships: Relationship[]
      }
      user_requirements: {
        Row: { id: string; user_id: string; requirement_id: string; status: RequirementStatus; note: string | null; document_id: string | null; response_text: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; requirement_id: string; status?: RequirementStatus; note?: string | null; document_id?: string | null; response_text?: string | null }
        Update: { status?: RequirementStatus; note?: string | null; document_id?: string | null; response_text?: string | null }
        Relationships: Relationship[]
      }
      universities: {
        Row: { id: string; name: string; short_name: string; location: string; description: string; programmes: string; application_deadline: string | null; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id: string; name: string; short_name: string; location: string; description: string; programmes: string; application_deadline?: string | null; is_active?: boolean }
        Update: { name?: string; short_name?: string; location?: string; description?: string; programmes?: string; application_deadline?: string | null; is_active?: boolean }
        Relationships: Relationship[]
      }
      university_selections: {
        Row: { user_id: string; university_id: string; selected_at: string }
        Insert: { user_id: string; university_id: string; selected_at?: string }
        Update: { selected_at?: string }
        Relationships: Relationship[]
      }
      university_updates: {
        Row: { id: string; university_id: string | null; title: string; description: string; category: UpdateCategory; published_at: string; created_at: string }
        Insert: { id?: string; university_id?: string | null; title: string; description: string; category?: UpdateCategory; published_at?: string }
        Update: { university_id?: string | null; title?: string; description?: string; category?: UpdateCategory; published_at?: string }
        Relationships: Relationship[]
      }
      notifications: {
        Row: { id: string; user_id: string; type: string; title: string; body: string; href: string; read_at: string | null; created_at: string }
        Insert: { id?: string; user_id: string; type: string; title: string; body: string; href?: string; read_at?: string | null; created_at?: string }
        Update: { read_at?: string | null }
        Relationships: Relationship[]
      }
      notification_preferences: {
        Row: { user_id: string; preferences: Json; updated_at: string }
        Insert: { user_id: string; preferences?: Json }
        Update: { preferences?: Json }
        Relationships: Relationship[]
      }
      system_notices: {
        Row: { id: string; title: string; body: string; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; title: string; body: string; is_active?: boolean }
        Update: { title?: string; body?: string; is_active?: boolean }
        Relationships: Relationship[]
      }
      staff_messages: {
        Row: { id: string; sender_id: string; body: string; reply_to_id: string | null; created_at: string; edited_at: string | null }
        Insert: { id?: string; sender_id: string; body: string; reply_to_id?: string | null }
        Update: { body?: string; reply_to_id?: string | null; edited_at?: string | null }
        Relationships: Relationship[]
      }
      staff_message_versions: {
        Row: { id: number; message_id: string; body: string; version: number; created_at: string }
        Insert: { id?: number; message_id: string; body: string; version: number }
        Update: never
        Relationships: Relationship[]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_staff: { Args: { check_user_id?: string }; Returns: boolean }
      is_admin: { Args: { check_user_id?: string }; Returns: boolean }
      create_support_ticket: { Args: { ticket_subject: string; first_message: string; ticket_priority?: TicketPriority }; Returns: string }
      reply_support_ticket: { Args: { target_ticket_id: string; message_body: string; next_status?: TicketStatus | null; internal_message?: boolean }; Returns: string }
      review_document: { Args: { target_document_id: string; decision: ReviewStatus; notes?: string; message_to_applicant?: string }; Returns: string }
      register_uploaded_document: { Args: { document_kind: string; uploaded_name: string; object_path: string; content_type: string; content_size: number }; Returns: string }
      toggle_university_selection: { Args: { target_university_id: string }; Returns: boolean }
      create_university_update: { Args: { update_title: string; update_description: string; update_category?: UpdateCategory; target_university_id?: string | null }; Returns: string }
      send_staff_message: { Args: { message_body: string; reply_to_message_id?: string | null }; Returns: string }
      edit_staff_message: { Args: { target_message_id: string; replacement_body: string }; Returns: string }
      create_requirement: { Args: { requirement_title: string; requirement_subtitle: string; requirement_guidance: string; requirement_submission_type: 'file' | 'text' | 'both' }; Returns: string }
      update_requirement: { Args: { requirement_id: string; requirement_title: string; requirement_subtitle: string; requirement_guidance: string; requirement_submission_type: 'file' | 'text' | 'both' }; Returns: string }
      delete_requirement: { Args: { requirement_id: string }; Returns: string }
      submit_requirement_text: { Args: { target_requirement_id: string; submitted_text: string }; Returns: string }
    }
    Enums: {
      app_role: AppRole
      ticket_status: TicketStatus
      ticket_priority: TicketPriority
      review_status: ReviewStatus
      application_status: ApplicationStatus
      requirement_status: RequirementStatus
      update_category: UpdateCategory
      payment_status: PaymentStatus
    }
    CompositeTypes: Record<string, never>
  }
}

export type TableRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TableInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
