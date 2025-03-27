
import { supabase } from './client'
import { Stats, StatsHistory } from './types'
import { MAX_HISTORY_RECORDS } from './client'

// Stats-related queries
export async function getStats(): Promise<Stats | null> {
  const { data, error } = await supabase
    .from('cct_stats_hist')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('Error fetching stats:', error)
    return null
  }
  
  return data ? {
    id: data.id,
    total: data.total,
    total_15: data.total_15,
    total_in_proces: data.total_in_proces
  } : null
}

export async function getStatsHistory(limit: number = MAX_HISTORY_RECORDS): Promise<StatsHistory[]> {
  const { data, error } = await supabase
    .from('cct_stats_hist')
    .select('id, total, total_15, total_in_proces, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching stats history:', error)
    return []
  }
  
  return (data || []).reverse()
}

export async function getSettings(): Promise<{ target_all: number | null, target_invoice: number | null, target_top: number | null } | null> {
  try {
    // Fetch the single row in the settings table by selecting the first row
    const { data, error } = await supabase
      .from('settings')
      .select('target_all, target_invoice, target_top')
      .limit(1)
      .single() // Use single() instead of maybeSingle() as we expect exactly one row
    
    if (error) {
      console.error('Error fetching settings:', error)
      return null
    }
    
    console.log('Settings data from database:', data)
    
    return {
      target_all: data.target_all,
      target_invoice: data.target_invoice,
      target_top: data.target_top
    }
  } catch (error) {
    console.error('Error in getSettings:', error)
    return null
  }
}
