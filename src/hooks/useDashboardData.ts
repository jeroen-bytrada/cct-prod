import { useState, useEffect, useCallback } from 'react';
import { 
  getStats, 
  getCustomerCount, 
  getStatsHistory,
  getSettings,
  getDocumentCount,
  Stats, 
  StatsHistory,
  supabase 
} from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export function useDashboardData() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsHistory, setStatsHistory] = useState<StatsHistory[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<{ 
    target_all: number | null, 
    target_invoice: number | null, 
    target_top: number | null 
  } | null>(null);
  const { toast } = useToast();

  const notifyDataUpdated = useCallback(() => {
    const event = new CustomEvent('stats_update');
    window.dispatchEvent(event);
    console.log('Dispatched stats_update event');
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, countData, historyData, docCountData] = await Promise.all([
        getStats(),
        getCustomerCount(),
        getStatsHistory(),
        getDocumentCount(),
      ]);
      
      setStats(statsData);
      setCustomerCount(countData);
      setStatsHistory(historyData);
      setDocumentCount(docCountData);
      
      console.log('Dashboard data loaded:', { statsData, docCountData });
      
      notifyDataUpdated();
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      
      fetchSettings();
    }
  }, [toast, notifyDataUpdated]);

  const fetchSettings = useCallback(async () => {
    try {
      const settingsData = await getSettings();
      
      if (settingsData) {
        const { id, ...settingsWithoutId } = settingsData;
        setSettings(settingsWithoutId);
        console.log('Settings loaded successfully:', settingsWithoutId);
      } else {
        console.error('Settings data is null - this should never happen');
        toast({
          title: "Critical Error",
          description: "Required application settings could not be loaded. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: "Critical Error",
        description: "Failed to load application settings. The application may not function properly.",
        variant: "destructive",
      });
    }
  }, [toast]);

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
          fetchSettings();
        }
      )
      .subscribe();
      
    const documentsChannel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_documents'
        },
        (payload) => {
          console.log('Documents table changed:', payload);
          fetchData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(statsHistChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(documentsChannel);
    };
  }, [fetchData, fetchSettings, toast]);

  return {
    stats,
    statsHistory,
    customerCount,
    documentCount,
    loading,
    settings,
    fetchData,
    fetchSettings
  };
}
