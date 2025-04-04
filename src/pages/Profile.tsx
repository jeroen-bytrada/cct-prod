
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, UserPen, Upload, Lock } from 'lucide-react';
import { getUserProfile } from '@/lib/supabase/user';
import { UserProfile } from '@/lib/supabase/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Password validation schema
  const passwordSchema = z.object({
    currentPassword: z.string().min(6, 'Huidig wachtwoord moet minimaal 6 tekens bevatten'),
    newPassword: z.string().min(6, 'Nieuw wachtwoord moet minimaal 6 tekens bevatten'),
    confirmPassword: z.string().min(6, 'Bevestiging moet minimaal 6 tekens bevatten'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

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

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        }
      });
      
      if (authError) throw authError;
      
      // Also update the public profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      toast.success('Profiel succesvol bijgewerkt');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Fout bij het bijwerken van profiel: ${error.message}`);
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
      toast.success('Profielfoto succesvol bijgewerkt');
    } catch (error: any) {
      if (error.message === "The resource already exists") {
        toast.error("Probeer het opnieuw met een andere afbeeldingsnaam");
      } else {
        toast.error(`Fout bij het uploaden van profielfoto: ${error.message}`);
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (values: z.infer<typeof passwordSchema>) => {
    if (!user) return;
    
    try {
      setPasswordUpdating(true);
      
      // First verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: values.currentPassword,
      });
      
      if (signInError) {
        toast.error('Huidig wachtwoord is onjuist');
        return;
      }
      
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      
      if (updateError) throw updateError;
      
      toast.success('Wachtwoord succesvol gewijzigd');
      setChangePasswordOpen(false);
      passwordForm.reset();
    } catch (error: any) {
      toast.error(`Fout bij het wijzigen van wachtwoord: ${error.message}`);
    } finally {
      setPasswordUpdating(false);
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
                  <span className="sr-only">Profielfoto uploaden</span>
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
                <h3 className="text-lg font-medium">Profielfoto</h3>
                <p className="text-sm text-gray-500">
                  Klik op de avatar om een nieuwe foto te uploaden. 
                  PNG, JPG of GIF. Max 5MB.
                </p>
                {uploadingAvatar && <p className="text-sm text-blue-500 mt-1">Uploaden...</p>}
              </div>
            </div>
            
            {/* Personal Info section */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <span>Persoonlijke Informatie</span>
                {!isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2" 
                    onClick={() => setIsEditing(true)}
                  >
                    <UserPen size={16} className="mr-1" />
                    Bewerken
                  </Button>
                )}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Volledige Naam</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Je volledige naam"
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-2 border border-transparent rounded-md bg-gray-50">
                      {fullName || 'Niet ingesteld'}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">E-mailadres</Label>
                  <div className="mt-1 p-2 border border-transparent rounded-md bg-gray-50">
                    {user?.email || 'Geen e-mail gevonden'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Je e-mailadres kan niet worden gewijzigd.
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
                  // Reset to original value from profile or user metadata
                  if (profile?.full_name) {
                    setFullName(profile.full_name);
                  } else if (user?.user_metadata.full_name) {
                    setFullName(user.user_metadata.full_name);
                  } else {
                    setFullName('');
                  }
                }}
              >
                Annuleren
              </Button>
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Opslaan...' : 'Wijzigingen Opslaan'}
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Wachtwoord Wijzigen
            </CardTitle>
            <CardDescription>
              Update je wachtwoord om je account te beveiligen.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!changePasswordOpen ? (
              <Button 
                variant="outline" 
                onClick={() => setChangePasswordOpen(true)}
              >
                Wachtwoord wijzigen
              </Button>
            ) : (
              <Form {...passwordForm}>
                <form 
                  onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Huidig wachtwoord</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Voer je huidige wachtwoord in" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nieuw wachtwoord</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Voer je nieuwe wachtwoord in" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bevestig nieuw wachtwoord</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Bevestig je nieuwe wachtwoord" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setChangePasswordOpen(false);
                        passwordForm.reset();
                      }}
                    >
                      Annuleren
                    </Button>
                    <Button 
                      type="submit"
                      disabled={passwordUpdating}
                    >
                      {passwordUpdating ? 'Wachtwoord wijzigen...' : 'Wachtwoord wijzigen'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
