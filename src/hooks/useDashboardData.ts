
import { useState, useEffect, useCallback } from 'react';
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
  const [settings, setSettings] = useState<{ 
    target_all: number | null, 
    target_invoice: number | null, 
    target_top: number | null 
  } | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, countData, historyData] = await Promise.all([
        getStats(),
        getCustomerCount(),
        getStatsHistory(),
      ]);
      
      setStats(statsData);
      setCustomerCount(countData);
      setStatsHistory(historyData);
      
      console.log('Dashboard data loaded:', { statsData });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      
      // Fetch settings immediately after loading initial data
      fetchSettings();
    }
  }, [toast]);

  // Function specifically for fetching settings
  const fetchSettings = useCallback(async () => {
    try {
      const settingsData = await getSettings();
      if (settingsData) {
        // We don't need the ID in the settings state
        const { id, ...settingsWithoutId } = settingsData;
        setSettings(settingsWithoutId);
        console.log('Settings loaded successfully:', settingsWithoutId);
      } else {
        console.warn('No settings found in the database');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, []);

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
      
    // Set up real-time subscription for settings table
    const settingsChannel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings'
        },
        (payload) => {
          console.log('Settings updated:', payload);
          fetchSettings(); // Only refresh settings when they change
        }
      )
      .subscribe();
    
    // Refresh settings every 5 seconds to ensure they're up to date
    const settingsRefreshInterval = setInterval(() => {
      fetchSettings();
    }, 5000); // 5000 ms = 5 seconds
    
    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(statsHistChannel);
      supabase.removeChannel(settingsChannel);
      clearInterval(settingsRefreshInterval);
    };
  }, [fetchData, fetchSettings, toast]);

  return {
    stats,
    statsHistory,
    customerCount,
    loading,
    settings,
    fetchData,
    fetchSettings // Expose the fetch settings function
  };
}
