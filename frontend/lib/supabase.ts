import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          is_admin: boolean
          is_banned: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          compare_price: number | null
          category_id: string | null
          collection_id: string | null
          images: string[]
          sizes: string[]
          colors: string[]
          stock: number
          sku: string | null
          is_featured: boolean
          is_best_seller: boolean
          is_active: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['products']['Row']>
        Update: Partial<Database['public']['Tables']['products']['Row']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          image_url: string | null
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['categories']['Row']>
        Update: Partial<Database['public']['Tables']['categories']['Row']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          customer_name: string
          customer_phone: string
          customer_address: string
          customer_city: string
          customer_postal_code: string | null
          customer_notes: string | null
          items: Record<string, unknown>[]
          subtotal: number
          delivery_fee: number
          total: number
          payment_method: string
          status: string
          status_history: Record<string, unknown>[]
          tracking_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['orders']['Row']>
        Update: Partial<Database['public']['Tables']['orders']['Row']>
      }
      banners: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          cta_text: string | null
          cta_link: string | null
          image_url: string
          type: string
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['banners']['Row']>
        Update: Partial<Database['public']['Tables']['banners']['Row']>
      }
      collections: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          image_url: string | null
          is_featured: boolean
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['collections']['Row']>
        Update: Partial<Database['public']['Tables']['collections']['Row']>
      }
      support_tickets: {
        Row: {
          id: string
          ticket_number: string
          user_id: string | null
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          status: string
          admin_reply: string | null
          replied_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['support_tickets']['Row']>
        Update: Partial<Database['public']['Tables']['support_tickets']['Row']>
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          body: string | null
          is_verified: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['reviews']['Row']>
        Update: Partial<Database['public']['Tables']['reviews']['Row']>
      }
    }
  }
}
