import { createClient } from '@supabase/supabase-js'
import { supabase as supabaseClient } from '@/integrations/supabase/client'

export type Customer = {
  id: string
  customer_name: string
  cs_documents_total?: number // Make it optional
  cs_documents_in_process: number
  cs_documents_other: number
  cs_last_update: string
  administration_name?: string | null
  administration_mail?: string | null
  source?: string | null
  source_root?: string | null
  is_active?: boolean | null
  created_at?: string | null
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

export type UserProfile = {
  id: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
}

export type UserRole = {
  id: string
  user_id: string
  role: 'admin' | 'user'
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

// Customer-related queries
export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('cct_customers')
    .select('*')
    .eq('is_active', true)  // Only get active customers
  
  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }
  
  // Map the data to include cs_documents_total
  return (data || []).map(customer => ({
    ...customer,
    cs_documents_total: 
      (customer.cs_documents_in_process || 0) + 
      (customer.cs_documents_other || 0)
  }))
}

export async function getCustomerById(customerId: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('cct_customers')
    .select('*')
    .eq('id', customerId)
    .eq('is_active', true)  // Only get active customers
    .single();
  
  if (error) {
    console.error('Error fetching customer by ID:', error);
    return null;
  }
  
  // Add cs_documents_total to the customer data
  return data ? {
    ...data,
    cs_documents_total: 
      (data.cs_documents_in_process || 0) + 
      (data.cs_documents_other || 0)
  } : null;
}

export async function getCustomerCount(): Promise<number> {
  const { count, error } = await supabase
    .from('cct_customers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)  // Only count active customers
  
  if (error) {
    console.error('Error fetching customer count:', error)
    return 0
  }
  
  return count || 0
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

// Stats-related queries
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

// Settings-related queries
export async function getSettings(): Promise<{
  target_all: number | null;
  target_invoice: number | null;
  target_top: number | null;
} | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('target_all, target_invoice, target_top')
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  
  return data;
}

// User profile-related queries
export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.session.user.id)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

export async function checkUserRole(role: 'admin' | 'user'): Promise<boolean> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    return false;
  }
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', session.session.user.id)
    .eq('role', role)
    .single();
  
  if (error) {
    // Error here often means no matching record was found
    return false;
  }
  
  return !!data;
}
