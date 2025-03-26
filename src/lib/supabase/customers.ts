
import { supabase } from './client'
import { Customer, CustomerDocument } from './types'
import { DOCUMENTS_PER_PAGE } from './client'

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
