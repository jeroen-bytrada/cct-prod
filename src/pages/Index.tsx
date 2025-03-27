
import React from 'react';
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
    loading,
    settings,
    fetchSettings
  } = useDashboardData();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-[190px] p-8 flex flex-col">
        <SearchBar />
        
        <DashboardHeader />
        
        <MetricsSection 
          loading={loading}
          stats={stats}
          statsHistory={statsHistory}
          customerCount={customerCount}
          settings={settings}
          fetchSettings={fetchSettings}
        />
        
        <div className="mt-8 flex-grow flex flex-col">
          <DataTable />
        </div>
      </div>
    </div>
  );
};

export default Index;
