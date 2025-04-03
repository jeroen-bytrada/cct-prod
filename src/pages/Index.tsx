
import React, { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import DataTable from '@/components/data-table/DataTable';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MetricsSection from '@/components/dashboard/MetricsSection';
import { useDashboardData } from '@/hooks/useDashboardData';

const Index: React.FC = () => {
  const {
    stats,
    statsHistory,
    customerCount,
    documentCount,
    loading,
    settings,
    fetchSettings,
    fetchData
  } = useDashboardData();

  // Fetch all dashboard data when the component mounts
  useEffect(() => {
    console.log('Dashboard mounted, refreshing all data from Supabase');
    // Force refresh all data
    fetchData(true);
  }, [fetchData]);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-[190px] p-8 flex flex-col">
        <DashboardHeader />
        
        <MetricsSection 
          loading={loading}
          stats={stats}
          statsHistory={statsHistory}
          customerCount={customerCount}
          documentCount={documentCount}
          settings={settings}
          fetchSettings={fetchSettings}
        />
        
        <div className="mt-6 flex-grow flex flex-col">
          <DataTable refreshData={fetchData} />
        </div>
      </div>
    </div>
  );
};

export default Index;
