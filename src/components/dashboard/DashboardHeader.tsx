
import React, { useEffect, useState, useCallback } from 'react';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/supabase/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AppSettings } from '@/lib/supabase/types';
import { toast } from 'sonner';

interface DashboardHeaderProps {
  username?: string;
  settings?: Omit<AppSettings, 'id'> | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, settings }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(username || 'Guest');
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);

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
      if (lastRunTime && newRunTime !== lastRunTime) {
        setIsRunning(false); // Re-enable button when last_update_run changes
      }
      setLastRunTime(newRunTime);
    }
  }, [settings?.last_update_run, lastRunTime]);

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
      const response = await fetch(settings.wh_run, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_by: user?.email || 'unknown'
        })
      });

      if (response.ok) {
        toast.success('Run gestart');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error triggering run:', error);
      toast.error(`Fout bij starten run: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
      setIsRunning(false); // Re-enable button on error
    }
  }, [settings?.wh_run, isRunning, user?.email]);

  return (
    <div className="flex justify-between items-center w-full mb-6">
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-2xl font-bold text-gray-900">Welkom, {displayName} 👋</h1>
        <p className="text-sm text-gray-600">Openstaande documenten in Snelstart en Dropbox</p>
      </div>
      <div className="flex items-center gap-4">
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
            disabled={isRunning || !settings?.wh_run}
          >
            Laatste run: {format(new Date(settings.last_update_run), 'dd-MM-yyyy HH:mm')}
          </Button>
        )}
        <SearchBar />
      </div>
    </div>
  );
};

export default DashboardHeader;
