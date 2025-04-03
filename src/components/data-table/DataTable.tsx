
import React, { useState, useEffect } from 'react';
import TableHeader from './TableHeader';
import TableColumns from './TableColumns';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import { useTableData } from './useTableData';
import CustomerDocumentsModal from '@/components/CustomerDocumentsModal';

interface DataTableProps {
  refreshData?: () => Promise<void>;
}

const DataTable: React.FC<DataTableProps> = ({ refreshData }) => {
  const {
    filteredCustomers,
    loading,
    searchText,
    setSearchText,
    sortConfig,
    handleSort,
    fetchCustomers
  } = useTableData();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);

  const handleViewDocuments = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setDocumentsModalOpen(true);
  };

  // Listen for dashboard data updates and refresh table data
  useEffect(() => {
    // Set up a listener for the stats_update event
    const handleStatsUpdate = () => {
      console.log('Dashboard stats updated, refreshing table data');
      fetchCustomers();
      
      // If parent component provided a refresh function, call it too
      if (refreshData) {
        refreshData();
      }
    };

    // Subscribe to the custom event
    window.addEventListener('stats_update', handleStatsUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('stats_update', handleStatsUpdate);
    };
  }, [fetchCustomers, refreshData]);

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
            customers={filteredCustomers} 
            loading={loading} 
            onViewDocuments={handleViewDocuments} 
          />
        </table>
      </div>

      <TableFooter 
        totalCount={filteredCustomers.length} 
        visibleCount={filteredCustomers.length} 
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
