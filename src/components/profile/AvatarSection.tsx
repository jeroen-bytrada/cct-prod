
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AvatarSectionProps {
  user: User | null;
  avatarUrl: string | null;
  setAvatarUrl: (url: string) => void;
}

const AvatarSection = ({ user, avatarUrl, setAvatarUrl }: AvatarSectionProps) => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-gray-200">
          <AvatarImage src={avatarUrl || ''} />
          <AvatarFallback className="text-lg">
            {getInitials(user?.user_metadata?.full_name)}
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
  );
};

export default AvatarSection;
