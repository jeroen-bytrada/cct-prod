
import React from 'react';
import { FileText } from 'lucide-react';
import { Customer } from '@/lib/supabase';
import { format } from 'date-fns';

interface CustomerRowProps {
  customer: Customer;
  onViewDocuments: (customerId: string) => void;
}

const CustomerRow: React.FC<CustomerRowProps> = ({ customer, onViewDocuments }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy - HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  return (
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
          onClick={() => onViewDocuments(customer.id)}
        >
          <FileText size={18} />
        </button>
      </td>
    </tr>
  );
};

export default CustomerRow;
