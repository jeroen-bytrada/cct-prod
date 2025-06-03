import { useState, useEffect, useCallback, useRef } from 'react';
import { Customer, getCustomers, supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { isEqual } from 'lodash';

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
    key: 'cs_documents_total', 
    direction: 'desc' 
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { toast } = useToast();
  
  // Reference to previous customer data to compare for changes
  const prevCustomersRef = useRef<Customer[]>([]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      
      // Check if data has actually changed
      const customersChanged = !isEqual(data, prevCustomersRef.current);
      
      if (customersChanged) {
        console.log('Customer data changed, updating table');
        setCustomers(data);
        
        const sortedData = sortData(data, sortConfig);
        setFilteredCustomers(sortedData);
        
        // Update reference to current values
        prevCustomersRef.current = data;
      } else {
        console.log('Customer data fetched, no changes detected');
      }
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
  }, [toast, sortConfig]);

  // Pagination logic
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCustomers.slice(startIndex, endIndex);
  };

  const goToNextPage = () => {
    const maxPage = Math.ceil(filteredCustomers.length / pageSize);
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = () => {
    return Math.ceil(filteredCustomers.length / pageSize);
  };

  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Sort data function
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
  }, [toast, fetchCustomers]);

  useEffect(() => {
    if (searchText.trim() === '') {
      const sortedData = sortData(customers, sortConfig);
      setFilteredCustomers(sortedData);
      
      // Reset to first page when search changes
      setCurrentPage(1);
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
    
    // Reset to first page when search results change
    setCurrentPage(1);
  }, [searchText, customers, sortConfig]);

  return {
    customers,
    filteredCustomers,
    paginatedCustomers: getPaginatedData(),
    loading,
    searchText,
    setSearchText,
    sortConfig,
    handleSort,
    fetchCustomers,
    // Pagination related
    currentPage,
    pageSize,
    goToNextPage,
    goToPreviousPage,
    totalPages,
    totalCount: filteredCustomers.length,
    changePageSize
  };
}
