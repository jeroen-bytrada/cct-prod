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
  customer_id: string | number  // Allow both string and number types
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

export const MAX_HISTORY_RECORDS = 10;
export const DOCUMENTS_PER_PAGE = 25;

// Enable real-time for the tables we need
async function enableRealtimeForTables() {
  try {
    await supabase.channel('any').subscribe();
    console.log('Real-time subscriptions enabled');
  } catch (error) {
    console.error('Failed to enable real-time:', error);
  }
}

// Initialize real-time
enableRealtimeForTables();

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

export async function getCustomerById(customerId: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('cct_customers')
    .select('*')
    .eq('id', customerId)
    .single();
  
  if (error) {
    console.error('Error fetching customer by ID:', error);
    return null;
  }
  
  return data;
}

export async function getCustomerDocuments(
  customerId: string | number, 
  page: number = 0, 
  pageSize: number = DOCUMENTS_PER_PAGE,
  filters: {
    dateFrom?: Date | null,
    dateTo?: Date | null,
  } = {}
): Promise<{ documents: CustomerDocument[], total: number }> {
  const id = typeof customerId === 'string' ? customerId : String(customerId);
  const from = page * pageSize;
  const to = from + pageSize - 1;
  
  let query = supabase
    .from('customer_documents')
    .select('*', { count: 'exact' })
    .eq('customer_id', id);
  
  // Apply date filters if provided
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom.toISOString());
  }
  
  if (filters.dateTo) {
    // Set time to end of day for the "to" date
    const dateTo = new Date(filters.dateTo);
    dateTo.setHours(23, 59, 59, 999);
    query = query.lte('created_at', dateTo.toISOString());
  }
  
  // Get total count with filters
  const countQuery = await query;
  const total = countQuery.count || 0;
  
  // Get paginated results with filters and ordering
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) {
    console.error('Error fetching customer documents:', error);
    return { documents: [], total: 0 };
  }
  
  return { 
    documents: (data || []).map(doc => ({
      ...doc,
      customer_id: String(doc.customer_id) // Convert to string to match our type
    })),
    total
  };
}
