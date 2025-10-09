
import React, { useEffect, useState, useCallback, useRef } from 'react';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/supabase/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AppSettings } from '@/lib/supabase/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  username?: string;
  settings?: Omit<AppSettings, 'id'> | null;
  onRefresh?: () => Promise<void>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, settings, onRefresh }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(username || 'Guest');
  const [isRunning, setIsRunning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRunTimeRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const profile = await getUserProfile();
        if (profile?.full_name) {
          setDisplayName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setDisplayName(user.user_metadata.full_name);
        } else if (user.email) {
          // Just use the first part of the email if no name is available
          setDisplayName(user.email.split('@')[0]);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Track last_update_run changes to enable/disable button
  useEffect(() => {
    if (settings?.last_update_run) {
      const newRunTime = settings.last_update_run;
      // Re-enable button when last_update_run changes (webhook completed)
      if (lastRunTimeRef.current && newRunTime !== lastRunTimeRef.current) {
        console.log('Laatste run updated, re-enabling button');
        setIsRunning(false);
      }
      lastRunTimeRef.current = newRunTime;
    }
  }, [settings?.last_update_run]);

  const handleRunClick = useCallback(async () => {
    if (!settings?.wh_run) {
      toast.error('Geen webhook URL geconfigureerd in instellingen');
      return;
    }

    if (isRunning) {
      return; // Prevent multiple clicks
    }

    setIsRunning(true);

    try {
      const { data, error } = await supabase.functions.invoke('trigger-webhook');

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success('Run gestart');
    } catch (error) {
      console.error('Error triggering run:', error);
      toast.error(`Fout bij starten run: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
      setIsRunning(false); // Re-enable button on error
    }
  }, [settings?.wh_run, isRunning]);

  const handleRefreshClick = useCallback(async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    
    try {
      // Refresh dashboard data
      await onRefresh();
      
      // Dispatch event to refresh table
      window.dispatchEvent(new CustomEvent('manual_refresh'));
      
      toast.success('Dashboard vernieuwd');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Fout bij vernieuwen');
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <div className="flex justify-between items-center w-full mb-6">
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-2xl font-bold text-gray-900">Welkom, {displayName} 👋</h1>
        <p className="text-sm text-gray-600">Openstaande documenten in Snelstart en Dropbox</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {settings?.last_update_run && (
            <Button
              variant={isRunning ? "secondary" : "outline"}
              size="sm"
              className={`text-sm transition-colors ${
                isRunning 
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200 cursor-not-allowed' 
                  : 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'
              }`}
              onClick={handleRunClick}
              disabled={isRunning}
            >
              Laatste run: {format(new Date(settings.last_update_run), 'dd-MM-yyyy HH:mm')}
            </Button>
          )}
          
          <Button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            variant="outline"
            size="icon"
            className="h-9 w-9"
            title="Vernieuw dashboard"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <SearchBar />
      </div>
    </div>
  );
};

export default DashboardHeader;
