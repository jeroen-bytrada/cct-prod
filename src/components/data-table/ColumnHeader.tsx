
import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Customer } from '@/lib/supabase';

interface ColumnHeaderProps {
  column: keyof Customer;
  label: string;
  sortConfig: {
    key: keyof Customer | null;
    direction: 'asc' | 'desc';
  };
  onSort: (column: keyof Customer) => void;
  className?: string;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ column, label, sortConfig, onSort, className }) => {
  const columnHeaderStyle = `py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none ${className || ''}`;
  
  const getSortIcon = () => {
    if (sortConfig.key !== column) {
      return null;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1 inline-block" /> 
      : <ArrowDown size={14} className="ml-1 inline-block" />;
  };

  return (
    <th 
      className={columnHeaderStyle}
      onClick={() => onSort(column)}
      onDoubleClick={() => onSort(column)}
    >
      {label} {getSortIcon()}
    </th>
  );
};

export default ColumnHeader;
