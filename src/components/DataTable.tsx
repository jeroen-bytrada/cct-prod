
import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  ChevronDown, 
  RotateCcw, 
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getCustomers, Customer } from '@/lib/supabase';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const DataTable: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy - HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm animate-slide-up" 
         style={{ animationDelay: '0.3s' }}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Filter By</span>
            <div className="relative">
              <Button 
                variant="outline" 
                className="flex items-center h-8 text-sm bg-white border-gray-200 gap-1"
              >
                <span>Client number</span>
                <ChevronDown size={14} className="text-gray-500" />
              </Button>
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                className="flex items-center h-8 text-sm bg-white border-gray-200 gap-1"
              >
                <span>Client Name</span>
                <ChevronDown size={14} className="text-gray-500" />
              </Button>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center h-8 text-sm bg-white border-gray-200 gap-1 text-buzzaroo-red"
          >
            <RotateCcw size={14} className="text-buzzaroo-red" />
            <span>Reset Filter</span>
          </Button>
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
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                    No customer data available
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
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
                      <button className="text-green-600 hover:text-green-800 transition-colors">
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
          Showing {customers.length > 0 ? `1-${Math.min(customers.length, 10)} of ${customers.length}` : '0 of 0'}
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
    </div>
  );
};

export default DataTable;
