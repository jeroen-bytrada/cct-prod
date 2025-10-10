
import React from 'react';
import CustomerRow from './CustomerRow';
import { Customer, AppSettings } from '@/lib/supabase';

interface TableBodyProps {
  customers: Customer[];
  loading: boolean;
  onViewDocuments: (customerId: string) => void;
  settings: AppSettings | null;
}

const TableBody: React.FC<TableBodyProps> = ({ customers, loading, onViewDocuments, settings }) => {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={8} className="py-4 px-4 text-center text-gray-500">
            Loading customer data...
          </td>
        </tr>
      </tbody>
    );
  }

  if (customers.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={8} className="py-4 px-4 text-center text-gray-500">
            No matching customers found
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-gray-100">
      {customers.map((customer) => (
        <CustomerRow 
          key={customer.id}
          customer={customer} 
          onViewDocuments={onViewDocuments}
          settings={settings}
        />
      ))}
    </tbody>
  );
};

export default TableBody;
