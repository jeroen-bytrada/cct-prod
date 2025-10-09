
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getStats, 
  getCustomerCount, 
  getStatsHistory,
  getSettings,
  getDocumentCount,
  Stats, 
  StatsHistory,
  AppSettings,
  supabase 
} from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export function useDashboardData() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsHistory, setStatsHistory] = useState<StatsHistory[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Omit<AppSettings, 'id'> | null>(null);
  const { toast } = useToast();
  
  // References to previous values to compare for actual changes
  const prevStatsRef = useRef<Stats | null>(null);
  const prevDocCountRef = useRef<number>(0);
  const prevCustomerCountRef = useRef<number>(0);

  const hasStatsChanged = (newStats: Stats | null, newDocCount: number, newCustomerCount: number): boolean => {
    // If no previous stats, consider it as changed
    if (!prevStatsRef.current) return true;
    
    // Check if any of the values changed
    return (
      prevStatsRef.current.total !== newStats?.total ||
      prevStatsRef.current.total_15 !== newStats?.total_15 ||
      prevStatsRef.current.total_in_proces !== newStats?.total_in_proces ||
      prevDocCountRef.current !== newDocCount ||
      prevCustomerCountRef.current !== newCustomerCount
    );
  };

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
      
      // Check if data has actually changed before updating state and notifying
      const hasChanged = hasStatsChanged(statsData, docCountData, countData);
      
      // Update state regardless (to ensure loading state is consistent)
      setStats(statsData);
      setCustomerCount(countData);
      setStatsHistory(historyData);
      setDocumentCount(docCountData);
      
      // Only notify of updates if values actually changed
      if (hasChanged) {
        console.log('Dashboard data changed, notifying subscribers');
        notifyDataUpdated();
        
        // Update refs to current values
        prevStatsRef.current = statsData;
        prevDocCountRef.current = docCountData;
        prevCustomerCountRef.current = countData;
      } else {
        console.log('Dashboard data fetched, no changes detected');
      }
      
      console.log('Dashboard data loaded:', { statsData, docCountData });
      
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
    
    // Only subscribe to settings changes for "Laatste run" timestamp updates
    // All other dashboard data will be static until page reload
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
    
    return () => {
      supabase.removeChannel(settingsChannel);
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
