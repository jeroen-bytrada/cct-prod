
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
    { key: 'inbox' as keyof Customer, label: 'Inbox' },
    { key: 'cs_last_update' as keyof Customer, label: 'Bijgewerkt' },
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
          />
        ))}
        <th className="py-3 px-4"></th>
      </tr>
    </thead>
  );
};

export default TableColumns;
