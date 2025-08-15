import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiration
const SESSION_REFRESH_TIME = 10 * 60 * 1000; // Refresh every 10 minutes

export const useSessionSecurity = () => {
  const { session } = useAuth();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);

  useEffect(() => {
    if (!session?.expires_at) return;

    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    // Show warning if session expires soon
    const warningTimeout = setTimeout(() => {
      if (!sessionWarningShown) {
        toast.warning('Your session will expire in 5 minutes. Please save your work.', {
          duration: 10000,
        });
        setSessionWarningShown(true);
      }
    }, Math.max(0, timeUntilExpiry - SESSION_WARNING_TIME));

    // Auto-refresh session periodically
    const refreshInterval = setInterval(async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        await supabase.auth.refreshSession();
      } catch (error) {
        console.error('Failed to refresh session:', error);
      }
    }, SESSION_REFRESH_TIME);

    return () => {
      clearTimeout(warningTimeout);
      clearInterval(refreshInterval);
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