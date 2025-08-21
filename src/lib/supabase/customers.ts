
import { supabase } from './client'
import { Customer, CustomerDocument } from './types'
import { DOCUMENTS_PER_PAGE } from './client'

// Customer-related queries
export async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_cct_customers')
    
    if (error) {
      console.error('Error fetching customers via RPC:', error)
      console.log('Falling back to direct table query with auth check')
      
      // Fallback to direct query with is_active filter
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (fallbackError) {
        console.error('Fallback query also failed:', fallbackError)
        return []
      }
      
      return (fallbackData || []).map(customer => ({
        ...customer,
        cs_documents_total: 
          (customer.cs_documents_in_process || 0) + 
          (customer.cs_documents_other || 0)
      }))
    }
    
    // Map the RPC data to include cs_documents_total
    return (data || []).map(customer => ({
      ...customer,
      cs_documents_total: 
        (customer.cs_documents_in_process || 0) + 
        (customer.cs_documents_other || 0)
    }))
  } catch (error) {
    console.error('Unexpected error in getCustomers:', error)
    return []
  }
}

export async function getCustomerById(customerId: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .rpc('get_cct_customers');
  
  if (error) {
    console.error('Error fetching customer by ID:', error);
    return null;
  }
  
  // Find the specific customer by ID and add cs_documents_total
  const customer = data?.find(c => c.id === customerId);
  return customer ? {
    ...customer,
    cs_documents_total: 
      (customer.cs_documents_in_process || 0) + 
      (customer.cs_documents_other || 0)
  } : null;
}

// Get ALL customers (no filtering) - used by Clients page
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching all customers:', error)
      return []
    }
    
    return (data || []).map(customer => ({
      ...customer,
      cs_documents_total: 
        (customer.cs_documents_in_process || 0) + 
        (customer.cs_documents_other || 0)
    }))
  } catch (error) {
    console.error('Unexpected error in getAllCustomers:', error)
    return []
  }
}

export async function getCustomerCount(): Promise<number> {
  const { data, error } = await supabase
    .rpc('get_cct_customers')
  
  if (error) {
    console.error('Error fetching customer count:', error)
    return 0
  }
  
  return data?.length || 0
}

export async function getDocumentCount(): Promise<number> {
  // Get the current date in YYYY-MM-DD format
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

  const { count, error } = await supabase
    .from('customer_documents')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);
  
  if (error) {
    console.error('Error fetching today\'s document count:', error)
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

// Add a new function to update a customer without affecting document fields
export async function updateCustomer(
  customerId: string,
  customerData: {
    customer_name: string,
    administration_name?: string | null,
    administration_mail?: string | null,
    source?: string | null,
    source_root?: string | null,
    is_active?: boolean | null,
    id?: string
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customers')
      .update({
        customer_name: customerData.customer_name,
        administration_name: customerData.administration_name,
        administration_mail: customerData.administration_mail,
        source: customerData.source,
        source_root: customerData.source_root,
        is_active: customerData.is_active,
        ...(customerData.id && customerData.id !== customerId ? { id: customerData.id } : {})
      })
      .eq('id', customerId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating customer:', error);
    return false;
  }
}
