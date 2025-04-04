
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase/types';

interface ProfileInfoSectionProps {
  user: User | null;
  profile: UserProfile | null;
  fullName: string;
  setFullName: (name: string) => void;
}

const ProfileInfoSection = ({ user, profile, fullName, setFullName }: ProfileInfoSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
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

      {isEditing && (
        <div className="flex justify-end gap-2 mt-4">
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
        </div>
      )}
    </div>
  );
};

export default ProfileInfoSection;
