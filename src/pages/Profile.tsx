
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, UserPen, Upload } from 'lucide-react';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    // If user is loaded and not authenticated, redirect to login
    if (!loading && !user) {
      navigate('/auth');
    }
    
    // Set the initial values from the user metadata
    if (user) {
      setFullName(user.user_metadata.full_name || '');
      setAvatarUrl(user.user_metadata.avatar_url || null);
    }
  }, [user, loading, navigate]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        }
      });
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }
    
    try {
      setUploadingAvatar(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      if (updateError) throw updateError;
      
      setAvatarUrl(publicUrl);
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      if (error.message === "The resource already exists") {
        toast.error("Please try again with a different image name");
      } else {
        toast.error(`Error uploading avatar: ${error.message}`);
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Manage your personal information and how it appears across the platform.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Avatar section */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-gray-200">
                  <AvatarImage src={avatarUrl || ''} />
                  <AvatarFallback className="text-lg">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                
                <label 
                  htmlFor="avatar-upload"
                  className="absolute inset-0 rounded-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200"
                >
                  <Upload size={20} />
                  <span className="sr-only">Upload avatar</span>
                </label>
                
                <input 
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Profile Photo</h3>
                <p className="text-sm text-gray-500">
                  Click on the avatar to upload a new photo. 
                  PNG, JPG or GIF. Max 5MB.
                </p>
                {uploadingAvatar && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
              </div>
            </div>
            
            {/* Personal Info section */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <span>Personal Information</span>
                {!isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2" 
                    onClick={() => setIsEditing(true)}
                  >
                    <UserPen size={16} className="mr-1" />
                    Edit
                  </Button>
                )}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-2 border border-transparent rounded-md bg-gray-50">
                      {fullName || 'Not set'}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="mt-1 p-2 border border-transparent rounded-md bg-gray-50">
                    {user?.email || 'No email found'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your email address cannot be changed.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          {isEditing && (
            <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset to original value
                  setFullName(user?.user_metadata.full_name || '');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
