import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yemvcztjbajkcgeqyggv.supabase.co'

const supabaseAnonKey =
  'sb_publishable_RTSREzFJoL7D4FjYWrHGtg_JOSV13br'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)