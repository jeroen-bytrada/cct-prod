
import React from 'react';
import { Layout } from '@/components/Layout';
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
    fetchSettings
  } = useDashboardData();

  return (
    <Layout>
      <div className="p-8 flex flex-col">
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
          <DataTable />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
