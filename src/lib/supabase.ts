import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          language: string
          currency: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      trips: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          cover_photo_url: string | null
          start_date: string | null
          end_date: string | null
          total_budget: number
          is_public: boolean
          share_token: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trips']['Row'], 'id' | 'created_at' | 'share_token'>
        Update: Partial<Database['public']['Tables']['trips']['Insert']>
      }
      stops: {
        Row: {
          id: string
          trip_id: string
          city_id: string
          position_order: number
          start_date: string | null
          end_date: string | null
        }
      }
      cities: {
        Row: {
          id: string
          name: string
          country: string
          region: string
          lat: number
          lng: number
          cost_index: number
          popularity_score: number
          cover_image_url: string | null
        }
      }
      activities: {
        Row: {
          id: string
          city_id: string
          name: string
          category: string
          cost_estimate: number
          duration_hours: number
          description: string | null
          image_url: string | null
        }
      }
      stop_activities: {
        Row: {
          id: string
          stop_id: string
          activity_id: string
          scheduled_time: string | null
          cost_override: number | null
          notes: string | null
        }
      }
      budgets: {
        Row: {
          id: string
          trip_id: string
          transport: number
          stay: number
          activities: number
          meals: number
          misc: number
          total_limit: number
        }
      }
      checklist_items: {
        Row: {
          id: string
          trip_id: string
          category: string
          item_name: string
          is_packed: boolean
          note: string | null
        }
      }
      trip_notes: {
        Row: {
          id: string
          trip_id: string
          stop_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
