import { createClient } from '@supabase/supabase-js'

export type Store = {
  id: number
  name: string
  category: string
  city: string
  neighborhood: string
  address: string
  lat: number
  lng: number
  tags: string[]
  note: string
  website: string | null
  instagram: string | null
  created_at: string
}

type Database = {
  public: {
    Tables: {
      stores: {
        Row: Store
        Insert: Omit<Store, 'id' | 'created_at'> & { id?: number; created_at?: string }
        Update: Partial<Omit<Store, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

type SupabaseClient = ReturnType<typeof createClient<Database>>

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.startsWith('your_')) {
    throw new Error('Supabase env vars not configured. See .env.local')
  }
  _client = createClient<Database>(url, key)
  return _client
}
