
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCustomers, Customer, supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import CustomerDocumentsModal from '@/components/CustomerDocumentsModal';

type SortDirection = 'asc' | 'desc';

type SortConfig = {
  key: keyof Customer | null;
  direction: SortDirection;
};

const DataTable: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
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
      
      // Fix for the instanceof Date error
      // Check if values are date strings and can be converted to dates
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        
        // Check if both are valid dates
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return config.direction === 'asc' 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime();
        }
      }
      
      // Default to string comparison for all other types
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

  const handleDoubleClick = (key: keyof Customer) => {
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

  const getSortIcon = (columnKey: keyof Customer) => {
    if (sortConfig.key !== columnKey) {
      return null;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1 inline-block" /> 
      : <ArrowDown size={14} className="ml-1 inline-block" />;
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy - HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const handleViewDocuments = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setDocumentsModalOpen(true);
  };

  const columnHeaderStyle = "py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none";

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm animate-slide-up flex flex-col h-full" 
         style={{ animationDelay: '0.3s' }}>
      <div className="p-4 border-b border-gray-100 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Zoek op klantnummer of klantnaam"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-buzzaroo-blue/20"
          />
        </div>
      </div>

      <div className="overflow-auto flex-grow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading customer data...</div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50/95 z-10">
              <tr className="border-b border-gray-100">
                <th 
                  className={columnHeaderStyle}
                  onClick={() => handleSort('id')}
                  onDoubleClick={() => handleDoubleClick('id')}
                >
                  Klantnr {getSortIcon('id')}
                </th>
                <th 
                  className={columnHeaderStyle}
                  onClick={() => handleSort('customer_name')}
                  onDoubleClick={() => handleDoubleClick('customer_name')}
                >
                  Klantnaam {getSortIcon('customer_name')}
                </th>
                <th 
                  className={columnHeaderStyle}
                  onClick={() => handleSort('cs_documents_total')}
                  onDoubleClick={() => handleDoubleClick('cs_documents_total')}
                >
                  Totaal {getSortIcon('cs_documents_total')}
                </th>
                <th 
                  className={columnHeaderStyle}
                  onClick={() => handleSort('cs_documents_in_process')}
                  onDoubleClick={() => handleDoubleClick('cs_documents_in_process')}
                >
                  Snelstart {getSortIcon('cs_documents_in_process')}
                </th>
                <th 
                  className={columnHeaderStyle}
                  onClick={() => handleSort('cs_documents_other')}
                  onDoubleClick={() => handleDoubleClick('cs_documents_other')}
                >
                  Overzicht {getSortIcon('cs_documents_other')}
                </th>
                <th 
                  className={columnHeaderStyle}
                  onClick={() => handleSort('cs_last_update')}
                  onDoubleClick={() => handleDoubleClick('cs_last_update')}
                >
                  Bijgewerkt {getSortIcon('cs_last_update')}
                </th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                    {customers.length === 0 ? "No customer data available" : "No matching customers found"}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.id}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.customer_name}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.cs_documents_total}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.cs_documents_in_process}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.cs_documents_other}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.cs_last_update)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-right">
                      <button 
                        className="text-green-600 hover:text-green-800 transition-colors"
                        onClick={() => handleViewDocuments(customer.id)}
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 mt-auto">
        <div className="text-sm text-gray-500">
          Getoond {filteredCustomers.length > 0 ? `1-${Math.min(filteredCustomers.length, 10)} of ${filteredCustomers.length}` : '0 of 0'}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-white border-gray-200"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-white border-gray-200"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </Button>
        </div>
      </div>

      <CustomerDocumentsModal
        isOpen={documentsModalOpen}
        onClose={() => setDocumentsModalOpen(false)}
        customerId={selectedCustomerId}
      />
    </div>
  );
};

export default DataTable;
