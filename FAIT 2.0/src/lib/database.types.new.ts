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
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          company: string | null
          user_role: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          company?: string | null
          user_role?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          company?: string | null
          user_role?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          client_id: string
          contractor_id: string | null
          status: string
          budget: number | null
          start_date: string | null
          end_date: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          client_id: string
          contractor_id?: string | null
          status?: string
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          client_id?: string
          contractor_id?: string | null
          status?: string
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_milestones: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          due_date: string | null
          completed_date: string | null
          status: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          due_date?: string | null
          completed_date?: string | null
          status?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          completed_date?: string | null
          status?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      punchlist_items: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: string
          assigned_to: string | null
          due_date: string | null
          completed_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          completed_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          completed_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      estimates: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          good_price: number | null
          better_price: number | null
          best_price: number | null
          selected_tier: string | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          good_price?: number | null
          better_price?: number | null
          best_price?: number | null
          selected_tier?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          good_price?: number | null
          better_price?: number | null
          best_price?: number | null
          selected_tier?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          valid_until?: string | null
        }
      }
      estimate_items: {
        Row: {
          id: string
          estimate_id: string
          description: string
          quantity: number
          unit: string | null
          good_unit_price: number | null
          better_unit_price: number | null
          best_unit_price: number | null
          good_total: number | null
          better_total: number | null
          best_total: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          estimate_id: string
          description: string
          quantity?: number
          unit?: string | null
          good_unit_price?: number | null
          better_unit_price?: number | null
          best_unit_price?: number | null
          good_total?: number | null
          better_total?: number | null
          best_total?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          estimate_id?: string
          description?: string
          quantity?: number
          unit?: string | null
          good_unit_price?: number | null
          better_unit_price?: number | null
          best_unit_price?: number | null
          good_total?: number | null
          better_total?: number | null
          best_total?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scope_of_work: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scope_sections: {
        Row: {
          id: string
          scope_id: string
          title: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scope_id: string
          title: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          scope_id?: string
          title?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      scope_items: {
        Row: {
          id: string
          section_id: string
          description: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          description: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          description?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          file_path: string
          file_type: string | null
          file_size: number | null
          document_type: string
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          file_path: string
          file_type?: string | null
          file_size?: number | null
          document_type: string
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          file_path?: string
          file_type?: string | null
          file_size?: number | null
          document_type?: string
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trade_partners: {
        Row: {
          id: string
          project_id: string
          profile_id: string
          trade: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          profile_id: string
          trade: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          profile_id?: string
          trade?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      rfps: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          due_date: string | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          due_date?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rfp_recipients: {
        Row: {
          id: string
          rfp_id: string
          profile_id: string
          status: string
          response_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rfp_id: string
          profile_id: string
          status?: string
          response_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rfp_id?: string
          profile_id?: string
          status?: string
          response_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mastery_scores: {
        Row: {
          id: string
          profile_id: string
          skill_score: number
          communication_score: number
          reliability_score: number
          overall_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          skill_score?: number
          communication_score?: number
          reliability_score?: number
          overall_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          skill_score?: number
          communication_score?: number
          reliability_score?: number
          overall_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          icon_url: string | null
          badge_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon_url?: string | null
          badge_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon_url?: string | null
          badge_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          profile_id: string
          badge_id: string
          awarded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          badge_id: string
          awarded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          badge_id?: string
          awarded_at?: string
          created_at?: string
        }
      }
      tokens: {
        Row: {
          id: string
          profile_id: string
          amount: number
          transaction_type: string
          description: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          amount: number
          transaction_type: string
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          amount?: number
          transaction_type?: string
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
      }
      marketplace_items: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number | null
          token_price: number | null
          image_url: string | null
          item_type: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price?: number | null
          token_price?: number | null
          image_url?: string | null
          item_type: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number | null
          token_price?: number | null
          image_url?: string | null
          item_type?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      training_modules: {
        Row: {
          id: string
          title: string
          description: string | null
          content_url: string | null
          duration: number | null
          difficulty: string | null
          token_reward: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content_url?: string | null
          duration?: number | null
          difficulty?: string | null
          token_reward?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content_url?: string | null
          duration?: number | null
          difficulty?: string | null
          token_reward?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_training_progress: {
        Row: {
          id: string
          profile_id: string
          module_id: string
          progress: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          module_id: string
          progress?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          module_id?: string
          progress?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      grants: {
        Row: {
          id: string
          title: string
          description: string | null
          provider: string | null
          amount: number | null
          application_url: string | null
          deadline: string | null
          eligibility_criteria: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          provider?: string | null
          amount?: number | null
          application_url?: string | null
          deadline?: string | null
          eligibility_criteria?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          provider?: string | null
          amount?: number | null
          application_url?: string | null
          deadline?: string | null
          eligibility_criteria?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          project_id: string | null
          message_text: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          project_id?: string | null
          message_text: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          project_id?: string | null
          message_text?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
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
