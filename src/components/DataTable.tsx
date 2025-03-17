
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  FileText,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCustomers, Customer } from '@/lib/supabase';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import CustomerDocumentsModal from '@/components/CustomerDocumentsModal';

const DataTable: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
        setFilteredCustomers(data);
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

    fetchCustomers();
  }, [toast]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredCustomers(customers);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = customers.filter(
      customer => 
        customer.id.toLowerCase().includes(searchLower) || 
        customer.customer_name.toLowerCase().includes(searchLower)
    );
    
    setFilteredCustomers(filtered);
  }, [searchText, customers]);

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

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm animate-slide-up" 
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

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading customer data...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klantnr
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klantnaam
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Totaal
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Snelstart
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overzicht
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bijgewerkt
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

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
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

      {/* Customer Documents Modal */}
      <CustomerDocumentsModal
        isOpen={documentsModalOpen}
        onClose={() => setDocumentsModalOpen(false)}
        customerId={selectedCustomerId}
      />
    </div>
  );
};

export default DataTable;
