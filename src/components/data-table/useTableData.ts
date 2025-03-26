
import { useState, useEffect } from 'react';
import { Customer, getCustomers, supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type SortDirection = 'asc' | 'desc';

type SortConfig = {
  key: keyof Customer | null;
  direction: SortDirection;
};

export function useTableData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'id', 
    direction: 'asc' 
  });
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
      
      const sortedData = sortData(data, sortConfig);
      setFilteredCustomers(sortedData);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customer data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortData = (data: Customer[], config: SortConfig): Customer[] => {
    if (!config.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[config.key as keyof Customer];
      const bValue = b[config.key as keyof Customer];

      if (aValue === null || aValue === undefined) return config.direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return config.direction === 'asc' ? -1 : 1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return config.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } 
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      } 
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return config.direction === 'asc' 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime();
        }
      }
      
      const aString = String(aValue);
      const bString = String(bValue);
      return config.direction === 'asc' 
        ? aString.localeCompare(bString) 
        : bString.localeCompare(aString);
    });
  };

  const handleSort = (key: keyof Customer) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      direction = 'asc';
    }
    
    const newConfig: SortConfig = { key, direction };
    setSortConfig(newConfig);
    
    const sortedData = sortData(filteredCustomers, newConfig);
    setFilteredCustomers(sortedData);
  };

  useEffect(() => {
    fetchCustomers();
    
    const customersChannel = supabase
      .channel('datatable-customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          console.log('Customer data changed:', payload);
          fetchCustomers();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(customersChannel);
    };
  }, [toast]);

  useEffect(() => {
    if (searchText.trim() === '') {
      const sortedData = sortData(customers, sortConfig);
      setFilteredCustomers(sortedData);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = customers.filter(
      customer => 
        customer.id.toLowerCase().includes(searchLower) || 
        customer.customer_name.toLowerCase().includes(searchLower)
    );
    
    const sortedFiltered = sortData(filtered, sortConfig);
    setFilteredCustomers(sortedFiltered);
  }, [searchText, customers, sortConfig]);

  return {
    customers,
    filteredCustomers,
    loading,
    searchText,
    setSearchText,
    sortConfig,
    handleSort
  };
}
