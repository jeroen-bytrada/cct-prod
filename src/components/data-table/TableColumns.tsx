
import React from 'react';
import ColumnHeader from './ColumnHeader';
import { Customer } from '@/lib/supabase';

interface TableColumnsProps {
  sortConfig: {
    key: keyof Customer | null;
    direction: 'asc' | 'desc';
  };
  onSort: (column: keyof Customer) => void;
}

const TableColumns: React.FC<TableColumnsProps> = ({ sortConfig, onSort }) => {
  const columns = [
    { key: 'id' as keyof Customer, label: 'Klantnr' },
    { key: 'customer_name' as keyof Customer, label: 'Klantnaam' },
    { key: 'cs_documents_total' as keyof Customer, label: 'Totaal' },
    { key: 'cs_documents_in_process' as keyof Customer, label: 'Snelstart' },
    { key: 'cs_documents_other' as keyof Customer, label: 'Calculate' },
    { key: 'cs_documents_inbox' as keyof Customer, label: 'Inbox' },
    { key: 'cs_last_update' as keyof Customer, label: 'Bijgewerkt' },
    { key: 'last_updated_by' as keyof Customer, label: 'Door' },
  ];

  return (
    <thead className="sticky top-0 bg-gray-50/95 z-10">
      <tr className="border-b border-gray-100">
        {columns.map((column) => (
          <ColumnHeader
            key={column.key}
            column={column.key}
            label={column.label}
            sortConfig={sortConfig}
            onSort={onSort}
            className={
              ['cs_documents_total', 'cs_documents_in_process', 'cs_documents_other', 'cs_documents_inbox'].includes(column.key) 
                ? 'w-32 min-w-32 text-center' 
                : column.key === 'last_updated_by' 
                ? 'w-32 min-w-32 text-left' 
                : ''
            }
          />
        ))}
        <th className="py-3 px-4"></th>
      </tr>
    </thead>
  );
};

export default TableColumns;
