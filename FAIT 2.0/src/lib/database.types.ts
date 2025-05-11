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
          user_id: string
          first_name: string | null
          last_name: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          business_name: string | null
          user_type: string
          verification_badge_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          business_name?: string | null
          user_type?: string
          verification_badge_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          business_name?: string | null
          user_type?: string
          verification_badge_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      service_agent_verification: {
        Row: {
          id: string
          service_agent_id: string
          verification_level: string
          verification_status: string
          is_verified: boolean
          verification_date: string | null
          expiration_date: string | null
          verified_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_agent_id: string
          verification_level?: string
          verification_status?: string
          is_verified?: boolean
          verification_date?: string | null
          expiration_date?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_agent_id?: string
          verification_level?: string
          verification_status?: string
          is_verified?: boolean
          verification_date?: string | null
          expiration_date?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_packages: {
        Row: {
          id: string
          service_agent_id: string
          title: string
          description: string
          price: number
          duration: number | null
          duration_unit: string | null
          category: string | null
          subcategory: string | null
          is_featured: boolean
          is_active: boolean
          image_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_agent_id: string
          title: string
          description: string
          price: number
          duration?: number | null
          duration_unit?: string | null
          category?: string | null
          subcategory?: string | null
          is_featured?: boolean
          is_active?: boolean
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_agent_id?: string
          title?: string
          description?: string
          price?: number
          duration?: number | null
          duration_unit?: string | null
          category?: string | null
          subcategory?: string | null
          is_featured?: boolean
          is_active?: boolean
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          service_agent_id: string
          service_package_id: string | null
          booking_date: string
          start_time: string
          end_time: string | null
          status: string
          total_amount: number
          payment_status: string
          payment_intent_id: string | null
          notes: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_agent_id: string
          service_package_id?: string | null
          booking_date: string
          start_time: string
          end_time?: string | null
          status?: string
          total_amount: number
          payment_status?: string
          payment_intent_id?: string | null
          notes?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          service_agent_id?: string
          service_package_id?: string | null
          booking_date?: string
          start_time?: string
          end_time?: string | null
          status?: string
          total_amount?: number
          payment_status?: string
          payment_intent_id?: string | null
          notes?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          booking_id: string | null
          message_text: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          booking_id?: string | null
          message_text: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          booking_id?: string | null
          message_text?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          interval: string
          features: string[]
          is_active: boolean
          stripe_price_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          interval: string
          features?: string[]
          is_active?: boolean
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          interval?: string
          features?: string[]
          is_active?: boolean
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_token_balance: {
        Args: {
          user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
