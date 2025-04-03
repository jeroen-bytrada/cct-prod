
import React, { useEffect, useState } from 'react';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/supabase/user';

interface DashboardHeaderProps {
  username?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(username || 'Guest');

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

  return (
    <div className="flex justify-between items-center w-full mb-6">
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-2xl font-bold text-gray-900">Welkom, {displayName} 👋</h1>
        <p className="text-sm text-gray-600">Openstaande documenten in Snelstart en Dropbox</p>
      </div>
      <SearchBar />
    </div>
  );
};

export default DashboardHeader;
