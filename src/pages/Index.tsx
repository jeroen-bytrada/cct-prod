import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import MetricCard from '@/components/MetricCard';
import StatisticChart from '@/components/StatisticChart';
import DataTable from '@/components/DataTable';
import { getStats, getCustomerCount, getStatsHistory, getSettings, Stats, StatsHistory, MAX_HISTORY_RECORDS, supabase } from '@/lib/supabase';
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

const calculatePercentageChange = (data: StatsHistory[], key: keyof Pick<StatsHistory, 'total' | 'total_15' | 'total_in_proces'>) => {
  if (data.length < 2) return 0;
  
  const current = Number(data[data.length - 1][key]) || 0;
  const previous = Number(data[data.length - 2][key]) || 0;
  
  if (previous === 0) return current > 0 ? 100 : 0;
  
  const change = ((current - previous) / previous) * 100;
  return Number(change.toFixed(2));
};

const Index: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsHistory, setStatsHistory] = useState<StatsHistory[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<{
    target_all: number | null;
    target_invoice: number | null;
    target_top: number | null;
  } | null>(null);
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

  const documentsPercentChange = calculatePercentageChange(statsHistory, 'total');
  const topPercentChange = calculatePercentageChange(statsHistory, 'total_15');
  const facturesPercentChange = calculatePercentageChange(statsHistory, 'total_in_proces');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, countData, historyData, settingsData] = await Promise.all([
        getStats(),
        getCustomerCount(),
        getStatsHistory(MAX_HISTORY_RECORDS),
        getSettings()
      ]);
      
      setStats(statsData);
      setCustomerCount(countData);
      setStatsHistory(historyData);
      setSettings(settingsData);
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

  useEffect(() => {
    fetchData();
    
    const customersChannel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          console.log('Customer table changed:', payload);
          fetchData();
        }
      )
      .subscribe();
      
    const statsHistChannel = supabase
      .channel('stats-hist-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cct_stats_hist'
        },
        (payload) => {
          console.log('Stats history updated:', payload);
          fetchData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(statsHistChannel);
    };
  }, [toast]);

  const isDocumentsOnTrack = React.useMemo(() => {
    if (!stats || !settings || settings.target_all === null) return false;
    return stats.total <= settings.target_all;
  }, [stats, settings]);

  const isTopOnTrack = React.useMemo(() => {
    if (!stats || !settings || settings.target_top === null) return false;
    return stats.total_15 <= settings.target_top;
  }, [stats, settings]);

  const isFacturesOnTrack = React.useMemo(() => {
    if (!stats || !settings || settings.target_invoice === null) return false;
    return stats.total_in_proces <= settings.target_invoice;
  }, [stats, settings]);

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
            <div className="h-[45px]"></div>
          </MetricCard>
          
          <MetricCard 
            title="Totaal Documenten" 
            value={loading ? "..." : (stats?.total || 0).toString()} 
            change={documentsPercentChange} 
            isNegative={documentsPercentChange < 0}
            isPositive={isDocumentsOnTrack}
            status={isDocumentsOnTrack ? "on-track" : "off-track"}
          >
            <StatisticChart 
              data={documentsChartData} 
              color={isDocumentsOnTrack ? "#4CAF50" : "#FF5252"} 
              isNegative={!isDocumentsOnTrack} 
            />
          </MetricCard>
          
          <MetricCard 
            title="Totaal top 1" 
            value={loading ? "..." : (stats?.total_15 || 0).toString()} 
            change={topPercentChange} 
            isNegative={topPercentChange < 0}
            isPositive={isTopOnTrack}
            status={isTopOnTrack ? "on-track" : "off-track"}
          >
            <StatisticChart 
              data={topChartData} 
              color={isTopOnTrack ? "#4CAF50" : "#FF5252"} 
              isNegative={!isTopOnTrack} 
            />
          </MetricCard>
          
          <MetricCard 
            title="Totaal Snelstart Facturen" 
            value={loading ? "..." : (stats?.total_in_proces || 0).toString()} 
            change={facturesPercentChange} 
            isNegative={facturesPercentChange < 0}
            isPositive={isFacturesOnTrack}
            status={isFacturesOnTrack ? "on-track" : "off-track"}
          >
            <StatisticChart 
              data={facturesChartData} 
              color={isFacturesOnTrack ? "#4CAF50" : "#FF5252"} 
              isNegative={!isFacturesOnTrack} 
            />
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
