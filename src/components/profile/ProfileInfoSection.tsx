
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

// Predefined badge colors that work well with black text
const BADGE_COLORS = [
  { name: 'Grijs', value: '#e5e7eb' },
  { name: 'Blauw', value: '#dbeafe' },
  { name: 'Groen', value: '#dcfce7' },
  { name: 'Geel', value: '#fef3c7' },
  { name: 'Roze', value: '#fce7f3' },
  { name: 'Paars', value: '#e9d5ff' },
  { name: 'Oranje', value: '#fed7aa' },
  { name: 'Rood', value: '#fecaca' },
];

const ProfileInfoSection = ({ user, profile, fullName, setFullName }: ProfileInfoSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBadgeColor, setSelectedBadgeColor] = useState('#e5e7eb');

  // Update selectedBadgeColor when profile changes
  React.useEffect(() => {
    if (profile?.badge_color) {
      setSelectedBadgeColor(profile.badge_color);
    }
  }, [profile]);

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
      
      // Also update the public profile including badge color
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          badge_color: selectedBadgeColor
        })
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

        <div>
          <Label htmlFor="badgeColor">Badge Kleur</Label>
          <p className="text-xs text-gray-500 mb-2">
            Kies een kleur voor je badge wanneer je updates maakt
          </p>
          {isEditing ? (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {BADGE_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedBadgeColor(color.value)}
                  className={`p-2 rounded-md border-2 transition-all ${
                    selectedBadgeColor === color.value 
                      ? 'border-blue-500 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  <span className="text-xs font-medium text-black">{color.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-1">
              <div 
                className="inline-flex px-3 py-1 rounded-md text-xs font-medium"
                style={{ backgroundColor: selectedBadgeColor }}
              >
                <span className="text-black">Voorbeeld Badge</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              // Reset to original values from profile or user metadata
              if (profile?.full_name) {
                setFullName(profile.full_name);
              } else if (user?.user_metadata.full_name) {
                setFullName(user.user_metadata.full_name);
              } else {
                setFullName('');
              }
              setSelectedBadgeColor(profile?.badge_color || '#e5e7eb');
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
