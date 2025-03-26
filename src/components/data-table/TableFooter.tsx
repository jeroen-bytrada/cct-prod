
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TableFooterProps {
  totalCount: number;
  visibleCount: number;
  pageSize?: number;
}

const TableFooter: React.FC<TableFooterProps> = ({ 
  totalCount, 
  visibleCount,
  pageSize = 10
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 mt-auto">
      <div className="text-sm text-gray-500">
        Getoond {visibleCount > 0 ? `1-${Math.min(visibleCount, pageSize)} of ${totalCount}` : '0 of 0'}
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
  );
};

export default TableFooter;
