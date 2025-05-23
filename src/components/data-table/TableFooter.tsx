
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TableFooterProps {
  totalCount: number;
  visibleCount: number;
  currentPage: number;
  pageSize: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const TableFooter: React.FC<TableFooterProps> = ({ 
  totalCount, 
  visibleCount,
  currentPage,
  pageSize,
  onPreviousPage,
  onNextPage
}) => {
  const startRange = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRange = Math.min(currentPage * pageSize, totalCount);
  const isFirstPage = currentPage === 1;
  const isLastPage = endRange === totalCount;
  
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 mt-auto">
      <div className="text-sm text-gray-500">
        Getoond {totalCount > 0 ? `${startRange}-${endRange} van ${totalCount}` : '0 van 0'}
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 bg-white border-gray-200"
          onClick={onPreviousPage}
          disabled={isFirstPage}
        >
          <ChevronLeft size={16} className={`${isFirstPage ? 'text-gray-300' : 'text-gray-500'}`} />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 bg-white border-gray-200"
          onClick={onNextPage}
          disabled={isLastPage}
        >
          <ChevronRight size={16} className={`${isLastPage ? 'text-gray-300' : 'text-gray-500'}`} />
        </Button>
      </div>
    </div>
  );
};

export default TableFooter;
