
import { supabase } from './client'
import { Stats, StatsHistory, AppSettings } from './types'
import { MAX_HISTORY_RECORDS } from './client'

// Stats-related queries
export async function getStats(): Promise<Stats | null> {
  // Get current stats using the secure function
  const { data, error } = await supabase
    .rpc('get_cct_stats')
  
  if (error) {
    console.error('Error fetching current stats:', error)
    // Fallback to latest from history if secure function fails
    return getStatsFromHistory()
  }
  
  return data && data.length > 0 ? {
    id: data[0].id,
    total: data[0].total,
    total_15: data[0].total_15,
    total_in_proces: data[0].total_in_proces
  } : null
}

// Fallback function to get stats from history
async function getStatsFromHistory(): Promise<Stats | null> {
  const { data, error } = await supabase
    .from('cct_stats_hist')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('Error fetching stats from history:', error)
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
  // Try to get the history_limit setting from the database
  let historyLimit = limit;
  
  try {
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('history_limit')
      .eq('id', 1)
      .single();
      
    if (!settingsError && settingsData && settingsData.history_limit) {
      // Use the setting from the database if available
      historyLimit = settingsData.history_limit;
      console.log(`Using history limit from settings: ${historyLimit}`);
    } else {
      console.log(`Using default history limit: ${historyLimit}`);
    }
  } catch (error) {
    // If there's an error, fall back to the provided limit
    console.error('Error fetching history limit setting:', error);
  }
  
  const { data, error } = await supabase
    .from('cct_stats_hist')
    .select('id, total, total_15, total_in_proces, created_at')
    .order('created_at', { ascending: false })
    .limit(historyLimit)
  
  if (error) {
    console.error('Error fetching stats history:', error)
    return []
  }
  
  return (data || []).reverse()
}

export async function getSettings(): Promise<AppSettings | null> {
  try {
    // Explicitly fetch the single settings record with ID 1
    const { data, error } = await supabase
      .from('settings')
      .select('id, target_all, target_invoice, target_top, history_limit, topx, last_update_run, wh_run, overdue_warning_days')
      .eq('id', 1)
      .maybeSingle() // Use maybeSingle() to handle the case where no record is found
    
    if (error) {
      // Log the specific error to help with debugging
      console.error('Error fetching settings:', error.message, error.details, error.hint)
      
      // This is a critical error since we need settings for the application to function properly
      throw new Error(`Failed to fetch required settings: ${error.message}`)
    }
    
    if (!data) {
      console.error('No settings found with ID 1 - application cannot function properly')
      throw new Error('Required settings record not found')
    }
    
    console.log('Settings data from database:', data)
    
    return {
      id: data.id,
      target_all: data.target_all,
      target_invoice: data.target_invoice,
      target_top: data.target_top,
      history_limit: data.history_limit || MAX_HISTORY_RECORDS, // Default to MAX_HISTORY_RECORDS if not set
      topx: data.topx || 5, // Default to 5 if not set
      last_update_run: data.last_update_run,
      wh_run: data.wh_run,
      overdue_warning_days: data.overdue_warning_days || 7
    }
  } catch (error) {
    console.error('Critical error in getSettings:', error)
    throw error // Re-throw to ensure calling code handles this error as critical
  }
}
