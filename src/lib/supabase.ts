import { createClient } from '@supabase/supabase-js'
import { supabase as supabaseClient } from '@/integrations/supabase/client'

export type Customer = {
  id: string
  customer_name: string
  cs_documents_total: number
  cs_documents_in_process: number
  cs_documents_other: number
  cs_last_update: string
}

export type CustomerDocument = {
  id: number
  customer_id: number | string
  document_name: string
  document_path: string
  document_type: string
  created_at: string
  uuid?: string
}

export type Stats = {
  id: number
  total: number
  total_15: number
  total_in_proces: number
}

export type StatsHistory = {
  id: number
  total: number
  total_15: number
  total_in_proces: number
  created_at: string
}

export const supabase = supabaseClient;

// Maximum number of historical records to fetch for charts
export const MAX_HISTORY_RECORDS = 10;

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('cct_customers')
    .select('*')
  
  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }
  
  return data || []
}

export async function getStats(): Promise<Stats | null> {
  const { data, error } = await supabase
    .from('cct_stats_hist')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    console.error('Error fetching stats:', error)
    return null
  }
  
  return {
    id: data.id,
    total: data.total,
    total_15: data.total_15,
    total_in_proces: data.total_in_proces
  }
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
  
  // Return the data in ascending order for charts (oldest to newest)
  return (data || []).reverse()
}

export async function getCustomerCount(): Promise<number> {
  const { count, error } = await supabase
    .from('cct_customers')
    .select('*', { count: 'exact', head: true })
  
  if (error) {
    console.error('Error fetching customer count:', error)
    return 0
  }
  
  return count || 0
}

export async function getCustomerDocuments(customerId: string | number): Promise<CustomerDocument[]> {
  const { data, error } = await supabase
    .from('customer_documents')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching customer documents:', error)
    return []
  }
  
  return data || []
}
