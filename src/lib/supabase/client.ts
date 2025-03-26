
import { supabase as supabaseClient } from '@/integrations/supabase/client'
import { enableRealtimeForTables } from './realtime'

export const supabase = supabaseClient

// Initialize real-time
enableRealtimeForTables()

export const MAX_HISTORY_RECORDS = 10
export const DOCUMENTS_PER_PAGE = 25
