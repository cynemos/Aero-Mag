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
      magazines: {
        Row: {
          id: string
          title: string
          issue_number: string
          publication_date: string | null
          price: number | null
          description: string | null
          cover_image_url: string | null
          keywords: string[] | null
          stock_status: 'available' | 'out_of_stock'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          issue_number: string
          publication_date?: string | null
          price?: number | null
          description?: string | null
          cover_image_url?: string | null
          keywords?: string[] | null
          stock_status?: 'available' | 'out_of_stock'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          issue_number?: string
          publication_date?: string | null
          price?: number | null
          description?: string | null
          cover_image_url?: string | null
          keywords?: string[] | null
          stock_status?: 'available' | 'out_of_stock'
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          magazine_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          magazine_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          magazine_id?: string
          quantity?: number
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          magazine_id: string
          quantity: number
          price_at_time: number
        }
        Insert: {
          id?: string
          order_id: string
          magazine_id: string
          quantity: number
          price_at_time: number
        }
        Update: {
          id?: string
          order_id?: string
          magazine_id?: string
          quantity?: number
          price_at_time?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          total_amount: number
          shipping_address: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          total_amount: number
          shipping_address: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total_amount?: number
          shipping_address?: Json
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
      [_ in never]: never
    }
  }
}
