export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      gyms: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          contact_email: string
          contact_phone: string | null
          website: string | null
          is_approved: boolean
          admin_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          contact_email: string
          contact_phone?: string | null
          website?: string | null
          is_approved?: boolean
          admin_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          contact_email?: string
          contact_phone?: string | null
          website?: string | null
          is_approved?: boolean
          admin_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'gym_admin' | 'coach' | 'gymnast' | 'host'
          gym_id: string | null
          phone: string | null
          date_of_birth: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role?: 'admin' | 'gym_admin' | 'coach' | 'gymnast' | 'host'
          gym_id?: string | null
          phone?: string | null
          date_of_birth?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'admin' | 'gym_admin' | 'coach' | 'gymnast' | 'host'
          gym_id?: string | null
          phone?: string | null
          date_of_birth?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      gymnasts: {
        Row: {
          id: string
          user_id: string
          gym_id: string
          level: string
          is_team_member: boolean
          approved_by_coach: boolean
          approved_by_coach_at: string | null
          approved_by_coach_id: string | null
          membership_status: 'pending' | 'active' | 'inactive' | 'suspended'
          total_points: number
          parent_email: string | null
          parent_phone: string | null
          emergency_contact: string | null
          medical_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gym_id: string
          level: string
          is_team_member?: boolean
          approved_by_coach?: boolean
          approved_by_coach_at?: string | null
          approved_by_coach_id?: string | null
          membership_status?: 'pending' | 'active' | 'inactive' | 'suspended'
          total_points?: number
          parent_email?: string | null
          parent_phone?: string | null
          emergency_contact?: string | null
          medical_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gym_id?: string
          level?: string
          is_team_member?: boolean
          approved_by_coach?: boolean
          approved_by_coach_at?: string | null
          approved_by_coach_id?: string | null
          membership_status?: 'pending' | 'active' | 'inactive' | 'suspended'
          total_points?: number
          parent_email?: string | null
          parent_phone?: string | null
          emergency_contact?: string | null
          medical_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          event_time: string | null
          location: string
          host_gym_id: string
          registration_deadline: string
          max_participants: number | null
          entry_fee: number
          ticket_price: number
          status: 'draft' | 'open' | 'closed' | 'completed' | 'cancelled'
          levels_allowed: string[]
          age_groups: string[]
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          event_time?: string | null
          location: string
          host_gym_id: string
          registration_deadline: string
          max_participants?: number | null
          entry_fee?: number
          ticket_price?: number
          status?: 'draft' | 'open' | 'closed' | 'completed' | 'cancelled'
          levels_allowed?: string[]
          age_groups?: string[]
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          location?: string
          host_gym_id?: string
          registration_deadline?: string
          max_participants?: number | null
          entry_fee?: number
          ticket_price?: number
          status?: 'draft' | 'open' | 'closed' | 'completed' | 'cancelled'
          levels_allowed?: string[]
          age_groups?: string[]
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          event_id: string
          gymnast_id: string
          status: 'pending' | 'approved' | 'rejected' | 'waitlisted'
          registered_at: string
          approved_at: string | null
          approved_by: string | null
          rejection_reason: string | null
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          gymnast_id: string
          status?: 'pending' | 'approved' | 'rejected' | 'waitlisted'
          registered_at?: string
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          gymnast_id?: string
          status?: 'pending' | 'approved' | 'rejected' | 'waitlisted'
          registered_at?: string
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          points: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category: string | null
          time_limit_days: number | null
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          points?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          category?: string | null
          time_limit_days?: number | null
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          points?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          category?: string | null
          time_limit_days?: number | null
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      challenge_completions: {
        Row: {
          id: string
          challenge_id: string
          gymnast_id: string
          status: 'pending' | 'approved' | 'rejected'
          completed_at: string
          approved_at: string | null
          approved_by: string | null
          evidence_notes: string | null
          points_awarded: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          gymnast_id: string
          status?: 'pending' | 'approved' | 'rejected'
          completed_at?: string
          approved_at?: string | null
          approved_by?: string | null
          evidence_notes?: string | null
          points_awarded?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          gymnast_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          completed_at?: string
          approved_at?: string | null
          approved_by?: string | null
          evidence_notes?: string | null
          points_awarded?: number
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          registration_id: string | null
          amount: number
          currency: string
          payment_type: string
          status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          paid_at: string | null
          refunded_at: string | null
          refund_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          registration_id?: string | null
          amount: number
          currency?: string
          payment_type: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          paid_at?: string | null
          refunded_at?: string | null
          refund_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          registration_id?: string | null
          amount?: number
          currency?: string
          payment_type?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          paid_at?: string | null
          refunded_at?: string | null
          refund_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'gym_admin' | 'coach' | 'gymnast' | 'host'
      membership_status: 'pending' | 'active' | 'inactive' | 'suspended'
      event_status: 'draft' | 'open' | 'closed' | 'completed' | 'cancelled'
      registration_status: 'pending' | 'approved' | 'rejected' | 'waitlisted'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
      challenge_difficulty: 'beginner' | 'intermediate' | 'advanced'
      completion_status: 'pending' | 'approved' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}