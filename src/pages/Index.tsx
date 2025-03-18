
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import MetricCard from '@/components/MetricCard';
import StatisticChart from '@/components/StatisticChart';
import DataTable from '@/components/DataTable';
import { getStats, getCustomerCount, getStatsHistory, Stats, StatsHistory, MAX_HISTORY_RECORDS } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Users } from 'lucide-react';

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

const formatHistoryData = (data: StatsHistory[], key: keyof Pick<StatsHistory, 'total' | 'total_15' | 'total_in_proces'>) => {
  return data.map(item => ({ value: Number(item[key]) || 0 }));
};

const Index: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsHistory, setStatsHistory] = useState<StatsHistory[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const defaultClientsChartData = generateChartData(MAX_HISTORY_RECORDS);
  const defaultDocumentsChartData = generateChartData(MAX_HISTORY_RECORDS, true);
  const defaultTopChartData = generateChartData(MAX_HISTORY_RECORDS);
  const defaultFacturesChartData = generateChartData(MAX_HISTORY_RECORDS);

  const documentsChartData = statsHistory.length > 0 
    ? formatHistoryData(statsHistory, 'total')
    : defaultDocumentsChartData;
  
  const topChartData = statsHistory.length > 0 
    ? formatHistoryData(statsHistory, 'total_15')
    : defaultTopChartData;
  
  const facturesChartData = statsHistory.length > 0 
    ? formatHistoryData(statsHistory, 'total_in_proces')
    : defaultFacturesChartData;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, countData, historyData] = await Promise.all([
          getStats(),
          getCustomerCount(),
          getStatsHistory(MAX_HISTORY_RECORDS)
        ]);
        
        setStats(statsData);
        setCustomerCount(countData);
        setStatsHistory(historyData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-[190px] p-8 flex flex-col">
        <SearchBar />
        
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Welkom, Jeroen 👋</h1>
          <p className="text-gray-600">Openstaande documenten in Snelstart en Dropbox</p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Aantal Klanten" 
            value={loading ? "..." : customerCount.toString()}
            hideStats={true}
            showIcon={true}
            iconComponent={<Users size={20} />}
          >
            <div className="h-[45px]"></div> {/* Empty div to match chart height */}
          </MetricCard>
          
          <MetricCard 
            title="Totaal Documenten" 
            value={loading ? "..." : (stats?.total || 0).toString()} 
            change={-5.45} 
            isNegative={true}
            status="off-track"
          >
            <StatisticChart data={documentsChartData} color="#FF5252" isNegative={true} />
          </MetricCard>
          
          <MetricCard 
            title="Totaal top 1" 
            value={loading ? "..." : (stats?.total_15 || 0).toString()} 
            change={24.45} 
            status="on-track"
          >
            <StatisticChart data={topChartData} color="#4CAF50" />
          </MetricCard>
          
          <MetricCard 
            title="Totaal Snelstart Facturen" 
            value={loading ? "..." : (stats?.total_in_proces || 0).toString()} 
            change={24.45} 
            status="on-track"
          >
            <StatisticChart data={facturesChartData} color="#4CAF50" />
          </MetricCard>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <DataTable />
        </div>
      </div>
    </div>
  );
};

export default Index;
