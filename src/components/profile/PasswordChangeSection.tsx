
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface PasswordChangeSectionProps {
  user: User | null;
}

const PasswordChangeSection = ({ user }: PasswordChangeSectionProps) => {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Password validation schema - Enhanced security with 8+ chars minimum
  const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Huidig wachtwoord is vereist'),
    newPassword: z.string()
      .min(8, 'Nieuw wachtwoord moet minimaal 8 tekens bevatten')
      .regex(/[A-Z]/, 'Wachtwoord moet minimaal één hoofdletter bevatten')
      .regex(/[a-z]/, 'Wachtwoord moet minimaal één kleine letter bevatten')
      .regex(/\d/, 'Wachtwoord moet minimaal één cijfer bevatten')
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Wachtwoord moet minimaal één speciaal teken bevatten'),
    confirmPassword: z.string().min(1, 'Bevestiging is vereist'),
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

  return (
    <>
      <div className="flex items-center">
        <Lock className="mr-2 h-5 w-5" />
        <h3 className="text-lg font-medium">Wachtwoord Wijzigen</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Update je wachtwoord om je account te beveiligen.
      </p>
      
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
    </>
  );
};

export default PasswordChangeSection;
