// Types de la base (voir supabase/migrations/20261112200000_schema_bibliotheque.sql)

export interface Database {
  public: {
    Tables: {
      magazines: {
        Row: {
          id: string
          title: string
          issue_number: string
          publication_date: string | null
          description: string | null
          cover_image_url: string | null
          keywords: string[] | null
          has_plan: boolean
          plan_model_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          issue_number: string
          publication_date?: string | null
          description?: string | null
          cover_image_url?: string | null
          keywords?: string[] | null
          has_plan?: boolean
          plan_model_name?: string | null
        }
        Update: {
          title?: string
          issue_number?: string
          publication_date?: string | null
          description?: string | null
          cover_image_url?: string | null
          keywords?: string[] | null
          has_plan?: boolean
          plan_model_name?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: { user_id: string; created_at: string }
        Insert: { user_id: string }
        Update: { user_id?: string }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
