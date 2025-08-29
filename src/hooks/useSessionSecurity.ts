import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SESSION_REFRESH_TIME = 10 * 60 * 1000; // Refresh every 10 minutes

export const useSessionSecurity = () => {
  const { session } = useAuth();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);

  useEffect(() => {
    if (!session?.expires_at) return;

    let refreshInterval: ReturnType<typeof setInterval> | undefined;

    const attemptRefresh = async (showToastOnError = false) => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase.auth.refreshSession();
        if (error) throw error;
        // Clear any previous error flag after a successful refresh
        setSessionWarningShown(false);
      } catch (error) {
        console.error('Failed to refresh session:', error);
        if (showToastOnError && !sessionWarningShown) {
          toast.warning("We couldn't refresh your session. Click to stay logged in.", {
            action: {
              label: 'Stay logged in',
              onClick: async () => {
                try {
                  const { supabase } = await import('@/lib/supabase');
                  const { error } = await supabase.auth.refreshSession();
                  if (error) throw error;
                  toast.success('Session refreshed.');
                  setSessionWarningShown(false);
                } catch (e) {
                  toast.error('Session refresh failed. Please log in again.');
                }
              },
            },
            duration: 10000,
          });
          setSessionWarningShown(true);
        }
      }
    };

    // Proactive, silent refresh
    refreshInterval = setInterval(() => {
      void attemptRefresh(true);
    }, SESSION_REFRESH_TIME);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [session, sessionWarningShown]);

  // Reset warning when session changes
  useEffect(() => {
    setSessionWarningShown(false);
  }, [session?.access_token]);

  return {
    sessionWarningShown,
  };
};