
import { useState, useEffect } from 'react';
import { 
  getStats, 
  getCustomerCount, 
  getStatsHistory, 
  getSettings,
  Stats, 
  StatsHistory,
  supabase 
} from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export function useDashboardData() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsHistory, setStatsHistory] = useState<StatsHistory[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<{ target_all: number | null, target_invoice: number | null, target_top: number | null } | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, countData, historyData, settingsData] = await Promise.all([
        getStats(),
        getCustomerCount(),
        getStatsHistory(),
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
    // Initial data fetch
    fetchData();
    
    // Set up real-time subscription for customers table
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
          fetchData(); // Refresh all data when customers table changes
        }
      )
      .subscribe();
      
    // Set up real-time subscription for cct_stats_hist table
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
          fetchData(); // Refresh all data when new stats history is added
        }
      )
      .subscribe();
    
    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(statsHistChannel);
    };
  }, [toast]);

  return {
    stats,
    statsHistory,
    customerCount,
    loading,
    settings,
    fetchData
  };
}
