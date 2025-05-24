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
      profiles: {
        Row: {
          id: string
          user_type: 'client' | 'service_agent'
          full_name: string
          email: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          created_at: string
          updated_at: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          user_type: 'client' | 'service_agent'
          full_name: string
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          user_type?: 'client' | 'service_agent'
          full_name?: string
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
        }
      }
      service_agent_service_areas: {
        Row: {
          id: string
          service_agent_id: string
          zip_code: string
          radius_miles: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_agent_id: string
          zip_code: string
          radius_miles: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_agent_id?: string
          zip_code?: string
          radius_miles?: number
          created_at?: string
          updated_at?: string
        }
      }
      service_agent_verifications: {
        Row: {
          id: string
          service_agent_id: string
          license_number: string | null
          license_type: string | null
          license_expiry: string | null
          insurance_provider: string | null
          insurance_expiry: string | null
          background_check_status: string
          background_check_date: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
          checkr_candidate_id: string | null
          checkr_report_id: string | null
          admin_verified: boolean
          admin_verified_at: string | null
        }
        Insert: {
          id?: string
          service_agent_id: string
          license_number?: string | null
          license_type?: string | null
          license_expiry?: string | null
          insurance_provider?: string | null
          insurance_expiry?: string | null
          background_check_status?: string
          background_check_date?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
          checkr_candidate_id?: string | null
          checkr_report_id?: string | null
          admin_verified?: boolean
          admin_verified_at?: string | null
        }
        Update: {
          id?: string
          service_agent_id?: string
          license_number?: string | null
          license_type?: string | null
          license_expiry?: string | null
          insurance_provider?: string | null
          insurance_expiry?: string | null
          background_check_status?: string
          background_check_date?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
          checkr_candidate_id?: string | null
          checkr_report_id?: string | null
          admin_verified?: boolean
          admin_verified_at?: string | null
        }
      }
      service_packages: {
        Row: {
          id: string
          service_agent_id: string
          title: string
          description: string
          price: number
          duration: string | null
          scope: string[]
          exclusions: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_agent_id: string
          title: string
          description: string
          price: number
          duration?: string | null
          scope: string[]
          exclusions?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_agent_id?: string
          title?: string
          description?: string
          price?: number
          duration?: string | null
          scope?: string[]
          exclusions?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          service_package_id: string
          scheduled_date: string
          status: string
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_package_id: string
          scheduled_date: string
          status?: string
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          service_package_id?: string
          scheduled_date?: string
          status?: string
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      warranty_claims: {
        Row: {
          id: string
          booking_id: string
          client_id: string
          description: string
          status: string
          resolution_notes: string | null
          created_at: string
          updated_at: string
          photo_urls: string[] | null
        }
        Insert: {
          id?: string
          booking_id: string
          client_id: string
          description: string
          status?: string
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
          photo_urls?: string[] | null
        }
        Update: {
          id?: string
          booking_id?: string
          client_id?: string
          description?: string
          status?: string
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
          photo_urls?: string[] | null
        }
      }
      points_transactions: {
        Row: {
          id: string
          user_id: string
          points_amount: number
          transaction_type: string
          description: string
          booking_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points_amount: number
          transaction_type: string
          description: string
          booking_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points_amount?: number
          transaction_type?: string
          description?: string
          booking_id?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          client_id: string
          rating: number
          comment: string
          created_at: string
          updated_at: string
          service_package_id: string
        }
        Insert: {
          id?: string
          booking_id: string
          client_id: string
          rating: number
          comment: string
          created_at?: string
          updated_at?: string
          service_package_id: string
        }
        Update: {
          id?: string
          booking_id?: string
          client_id?: string
          rating?: number
          comment?: string
          created_at?: string
          updated_at?: string
          service_package_id?: string
        }
      }
      external_reviews: {
        Row: {
          id: string
          service_agent_id: string
          platform: string
          url: string
          rating: number | null
          review_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_agent_id: string
          platform: string
          url: string
          rating?: number | null
          review_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_agent_id?: string
          platform?: string
          url?: string
          rating?: number | null
          review_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      service_agent_portfolio_items: {
        Row: {
          id: string
          service_agent_id: string
          title: string
          description: string
          image_urls: string[]
          completion_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_agent_id: string
          title: string
          description: string
          image_urls: string[]
          completion_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_agent_id?: string
          title?: string
          description?: string
          image_urls?: string[]
          completion_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      service_agent_work_history: {
        Row: {
          id: string
          service_agent_id: string
          company_name: string
          position: string
          start_date: string
          end_date: string | null
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_agent_id: string
          company_name: string
          position: string
          start_date: string
          end_date?: string | null
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_agent_id?: string
          company_name?: string
          position?: string
          start_date?: string
          end_date?: string | null
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      service_agent_references: {
        Row: {
          id: string
          service_agent_id: string
          name: string
          company: string | null
          email: string | null
          phone: string | null
          relationship: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_agent_id: string
          name: string
          company?: string | null
          email?: string | null
          phone?: string | null
          relationship: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_agent_id?: string
          name?: string
          company?: string | null
          email?: string | null
          phone?: string | null
          relationship?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          booking_id: string
          sender_id: string
          recipient_id: string
          content: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      service_agent_portfolio_items: {
        Row: {
          id: string
          service_agent_id: string
          title: string
          description: string | null
          image_url: string
          tags: string[] | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_agent_id: string
          title: string
          description?: string | null
          image_url: string
          tags?: string[] | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_agent_id?: string
          title?: string
          description?: string | null
          image_url?: string
          tags?: string[] | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}