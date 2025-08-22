
import React, { useState, useEffect } from 'react';
import { FileText, Check } from 'lucide-react';
import { Customer } from '@/lib/supabase';
import { format } from 'date-fns';
import { updateCustomerLastUpdate } from '@/lib/supabase/customers';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getUserBadgeColor } from '@/lib/supabase/userBadgeColors';

interface CustomerRowProps {
  customer: Customer;
  onViewDocuments: (customerId: string) => void;
}

const CustomerRow: React.FC<CustomerRowProps> = ({ customer, onViewDocuments }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [badgeColor, setBadgeColor] = useState<string>('#e5e7eb');
  const { toast } = useToast();

  // Fetch the user's badge color when component mounts or when last_updated_by changes
  useEffect(() => {
    const fetchBadgeColor = async () => {
      if (customer.last_updated_by) {
        const color = await getUserBadgeColor(customer.last_updated_by);
        setBadgeColor(color);
      }
    };
    
    fetchBadgeColor();
  }, [customer.last_updated_by]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy - HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const handleUpdateLastUpdate = async () => {
    setIsUpdating(true);
    try {
      const success = await updateCustomerLastUpdate(customer.id);
      if (success) {
        toast({
          title: "Bijgewerkt",
          description: "Klant is succesvol bijgewerkt",
        });
        // Trigger a custom event to refresh data
        window.dispatchEvent(new CustomEvent('stats_update'));
      } else {
        toast({
          title: "Fout",
          description: "Kon klant niet bijwerken",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr 
      key={customer.id} 
      className="hover:bg-gray-50 transition-colors duration-150"
    >
      <td className="py-2 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {customer.id}
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">
        {customer.customer_name}
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900 w-32 min-w-32 text-center">
        {customer.cs_documents_total}
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900 w-32 min-w-32 text-center">
        {customer.cs_documents_in_process}
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900 w-32 min-w-32 text-center">
        {customer.cs_documents_other}
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900 w-32 min-w-32 text-center">
        {customer.cs_documents_inbox || 0}
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-sm text-center w-20 min-w-20">
        <div className="flex justify-center">
          <div 
            className={`
              w-4 h-4 rounded-full flex items-center justify-center
              ${customer.last_updated_by === null || customer.last_updated_by === "CCT" 
                ? 'bg-green-600' 
                : 'bg-white border-2 border-green-600'
              }
            `}
            title={customer.last_updated_by === null || customer.last_updated_by === "CCT" ? 'Systeem bijgewerkt' : 'Gebruiker bijgewerkt'}
          >
            {customer.last_updated_by === null || customer.last_updated_by === "CCT" ? (
              <Check size={10} className="text-white" />
            ) : (
              <Check size={10} className="text-green-600" />
            )}
          </div>
        </div>
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900 w-32 min-w-32 text-center">
        {customer.last_updated_by && (
          <Badge 
            variant="secondary" 
            className="text-xs text-black border-0"
            style={{ backgroundColor: badgeColor }}
          >
            {customer.last_updated_by}
          </Badge>
        )}
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>{formatDate(customer.cs_last_update)}</span>
        </div>
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-sm text-right">
        <div className="flex items-center gap-2 justify-end">
          <button 
            className={`
              w-4 h-4 rounded-full flex items-center justify-center transition-colors disabled:opacity-50
              ${customer.last_updated_by === null || customer.last_updated_by === "CCT" 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50'
              }
            `}
            onClick={handleUpdateLastUpdate}
            disabled={isUpdating}
            title="Bijwerken"
          >
            <Check size={12} className={isUpdating ? 'animate-pulse' : ''} />
          </button>
          <button 
            className="text-blue-600 hover:text-blue-800 transition-colors"
            onClick={() => onViewDocuments(customer.id)}
            title="Documenten bekijken"
          >
            <FileText size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CustomerRow;
