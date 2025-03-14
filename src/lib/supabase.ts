
import { createClient } from '@supabase/supabase-js'

export type Customer = {
  id: number
  customer_name: string
  cs_documents_total: number
  cs_documents_in_process: number
  cs_documents_other: number
  cs_last_update: string
}

export type Stats = {
  id: number
  total: number
  total_15: number
  total_in_process: number
}

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

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
    .from('cct_stats')
    .select('*')
    .limit(1)
    .single()
  
  if (error) {
    console.error('Error fetching stats:', error)
    return null
  }
  
  return data
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
