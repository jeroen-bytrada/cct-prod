
import React from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import MetricCard from '@/components/MetricCard';
import StatisticChart from '@/components/StatisticChart';
import DataTable from '@/components/DataTable';

// Generate random chart data
const generateChartData = (length: number, isNegative = false) => {
  const startValue = isNegative ? 80 : 20;
  const endValue = isNegative ? 20 : 80;
  
  return Array.from({ length }, (_, i) => {
    const progress = i / (length - 1);
    const randomFactor = Math.random() * 15 - 7.5;
    const value = startValue + (endValue - startValue) * progress + randomFactor;
    return { value: Math.max(0, value) };
  });
};

const Index: React.FC = () => {
  // Generate data for charts
  const clientsChartData = generateChartData(20);
  const documentsChartData = generateChartData(20, true);
  const topChartData = generateChartData(20);
  const facturesChartData = generateChartData(20);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-[190px] p-8">
        <SearchBar />
        
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Welkom, Jeroen 👋</h1>
          <p className="text-gray-600">Openstaande documenten in Snelstart en Dropbox</p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Aantal Klanten" 
            value="5000" 
            change={24.45} 
            status="on-track"
          >
            <StatisticChart data={clientsChartData} color="#4CAF50" />
          </MetricCard>
          
          <MetricCard 
            title="Totaal Documenten" 
            value="80,000" 
            change={-5.45} 
            isNegative={true}
            status="off-track"
          >
            <StatisticChart data={documentsChartData} color="#FF5252" isNegative={true} />
          </MetricCard>
          
          <MetricCard 
            title="Totaal top 1" 
            value="10" 
            change={24.45} 
            status="on-track"
          >
            <StatisticChart data={topChartData} color="#4CAF50" />
          </MetricCard>
          
          <MetricCard 
            title="Totaal Snelstart Facturen" 
            value="40593" 
            change={24.45} 
            status="on-track"
          >
            <StatisticChart data={facturesChartData} color="#4CAF50" />
          </MetricCard>
        </div>
        
        <div className="mt-8">
          <DataTable />
        </div>
      </div>
    </div>
  );
};

export default Index;
