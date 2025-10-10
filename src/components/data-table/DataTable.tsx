
import React, { useState, useEffect } from 'react';
import TableHeader from './TableHeader';
import TableColumns from './TableColumns';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import { useTableData } from './useTableData';
import CustomerDocumentsModal from '@/components/CustomerDocumentsModal';
import { AppSettings } from '@/lib/supabase';

interface DataTableProps {
  refreshData?: () => Promise<void>;
  settings: AppSettings | null;
}

const DataTable: React.FC<DataTableProps> = ({ refreshData, settings }) => {
  const {
    filteredCustomers,
    paginatedCustomers,
    loading,
    searchText,
    setSearchText,
    sortConfig,
    handleSort,
    fetchCustomers,
    currentPage,
    pageSize,
    goToNextPage,
    goToPreviousPage,
    totalCount,
    changePageSize
  } = useTableData();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);

  const handleViewDocuments = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setDocumentsModalOpen(true);
  };

  // Listen for manual refresh event
  useEffect(() => {
    const handleManualRefresh = () => {
      console.log('Manual refresh triggered, refreshing table data');
      fetchCustomers();
    };

    window.addEventListener('manual_refresh', handleManualRefresh);
    
    return () => {
      window.removeEventListener('manual_refresh', handleManualRefresh);
    };
  }, [fetchCustomers]);


  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm animate-slide-up flex flex-col h-full" 
         style={{ animationDelay: '0.3s' }}>
      <TableHeader 
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <div className="overflow-auto flex-grow">
        <table className="w-full">
          <TableColumns 
            sortConfig={sortConfig} 
            onSort={handleSort} 
          />
          <TableBody 
            customers={paginatedCustomers} 
            loading={loading} 
            onViewDocuments={handleViewDocuments}
            settings={settings}
          />
        </table>
      </div>

      <TableFooter 
        totalCount={totalCount}
        visibleCount={paginatedCustomers.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        onPageSizeChange={changePageSize}
      />

      <CustomerDocumentsModal
        isOpen={documentsModalOpen}
        onClose={() => setDocumentsModalOpen(false)}
        customerId={selectedCustomerId}
      />
    </div>
  );
};

export default DataTable;
