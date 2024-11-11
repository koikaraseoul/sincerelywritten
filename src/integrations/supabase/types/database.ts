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
      practices: {
        Row: {
          id: string
          user_id: string
          action_taken: string
          reflection: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_taken: string
          reflection: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_taken?: string
          reflection?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "practices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}