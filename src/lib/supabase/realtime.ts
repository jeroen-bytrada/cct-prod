
import { supabase } from './client'

// Enable real-time for the tables we need
export async function enableRealtimeForTables() {
  try {
    await supabase.channel('any').subscribe()
    console.log('Real-time subscriptions enabled')
  } catch (error) {
    console.error('Failed to enable real-time:', error)
  }
}
