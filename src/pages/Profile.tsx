
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/supabase/user';
import { UserProfile } from '@/lib/supabase/types';
import AvatarSection from '@/components/profile/AvatarSection';
import ProfileInfoSection from '@/components/profile/ProfileInfoSection';
import PasswordChangeSection from '@/components/profile/PasswordChangeSection';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // If user is loaded and not authenticated, redirect to login
    if (!loading && !user) {
      navigate('/auth');
    }
    
    // Fetch user profile from profiles table
    const fetchProfile = async () => {
      if (user) {
        const profileData = await getUserProfile();
        setProfile(profileData);
        
        // Set fullName from profile if available, otherwise from user metadata
        if (profileData?.full_name) {
          setFullName(profileData.full_name);
        } else if (user.user_metadata.full_name) {
          setFullName(user.user_metadata.full_name);
        }
        
        setAvatarUrl(user.user_metadata.avatar_url || null);
      }
    };
    
    fetchProfile();
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-pulse">Profiel laden...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <h1 className="text-3xl font-bold mb-6">Mijn Profiel</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profielinformatie</CardTitle>
            <CardDescription>
              Beheer je persoonlijke informatie en hoe deze op het platform wordt weergegeven.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Avatar section */}
            <AvatarSection 
              user={user} 
              avatarUrl={avatarUrl} 
              setAvatarUrl={url => setAvatarUrl(url)} 
            />
            
            {/* Personal Info section */}
            <ProfileInfoSection 
              user={user} 
              profile={profile} 
              fullName={fullName}
              setFullName={setFullName}
            />
          </CardContent>
        </Card>
        
        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <CardTitle>Wachtwoord Wijzigen</CardTitle>
            <CardDescription>
              Update je wachtwoord om je account te beveiligen.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <PasswordChangeSection user={user} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
