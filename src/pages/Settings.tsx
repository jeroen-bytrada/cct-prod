
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type UserWithRole = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};

const settingsFormSchema = z.object({
  target_all: z.coerce.number().nullable().optional(),
  target_invoice: z.coerce.number().nullable().optional(),
  target_top: z.coerce.number().nullable().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const Settings = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Form setup
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      target_all: null,
      target_invoice: null,
      target_top: null,
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Only fetch users if the current user is an admin
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');
        
      if (profilesError) {
        throw profilesError;
      }
      
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
        
      if (rolesError) {
        throw rolesError;
      }
      
      // Combine profiles with roles
      const usersWithRoles = profiles.map(profile => {
        const userRole = userRoles.find(role => role.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: userRole?.role || 'user'
        };
      });
      
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    if (!isAdmin) return;
    
    try {
      setSettingsLoading(true);
      setSettingsError(null);
      
      // Explicitly fetch the settings with ID 1 using single() to indicate we expect exactly one record
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // This is the error code when no rows are returned by .single()
          console.error('CRITICAL ERROR: No settings record found with ID 1');
          setSettingsError('Settings record with ID 1 not found. The application cannot function properly.');
          toast.error('Critical error: Required settings record not found');
        } else {
          console.error('Error fetching settings:', error);
          setSettingsError(`Failed to load settings: ${error.message}`);
          toast.error('Failed to load application settings');
        }
        return;
      }
      
      if (data) {
        console.log('Successfully loaded settings:', data);
        
        // Set the form values with the retrieved data
        form.reset({
          target_all: data.target_all,
          target_invoice: data.target_invoice,
          target_top: data.target_top,
        });
      } else {
        // This should never happen with .single() but handle it just in case
        console.error('No settings data returned but no error was thrown');
        setSettingsError('Required settings not found');
        toast.error('Failed to load required settings');
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      setSettingsError('An unexpected error occurred while loading settings');
      toast.error('Failed to load application settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      
      if (currentRole === 'admin') {
        // Demote from admin to user
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
          
        if (error) throw error;
        
        // Ensure they have the user role
        const { error: insertError } = await supabase
          .from('user_roles')
          .upsert({ user_id: userId, role: 'user' });
          
        if (insertError) throw insertError;
      } else {
        // Promote to admin
        const { error } = await supabase
          .from('user_roles')
          .upsert({ user_id: userId, role: 'admin' });
          
        if (error) throw error;
      }
      
      toast.success(`Gebruikersrol gewijzigd naar ${newRole}`);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole } 
          : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Gebruikersrol wijzigen mislukt');
    }
  };

  const onSubmitSettings = async (values: SettingsFormValues) => {
    if (!isAdmin) return;
    
    try {
      // Always update the settings with ID 1
      const { error } = await supabase
        .from('settings')
        .update({
          target_all: values.target_all,
          target_invoice: values.target_invoice,
          target_top: values.target_top,
        })
        .eq('id', 1);
        
      if (error) {
        console.error('Error updating settings:', error);
        toast.error('Instellingen bijwerken mislukt');
        return;
      }
      
      toast.success('Instellingen succesvol bijgewerkt');
      
      // Reload settings to ensure the UI shows the current values
      fetchSettings();
    } catch (error) {
      console.error('Error in onSubmitSettings:', error);
      toast.error('Instellingen bijwerken mislukt');
    }
  };

  return (
    <Layout>
      <div className="flex-1 p-8 flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Instellingen</h1>
        
        {!isAdmin ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-medium mb-2">Gebruikersinstellingen</h2>
            <p className="text-gray-600">
              Je gebruikersaccount heeft geen administratieve rechten.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="app-settings" className="w-full">
            <TabsList>
              <TabsTrigger value="app-settings">Applicatie-instellingen</TabsTrigger>
              <TabsTrigger value="user-management">Gebruikersbeheer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="app-settings" className="mt-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-medium mb-4">Applicatieconfiguratie</h2>
                
                {settingsError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {settingsError}
                    </AlertDescription>
                  </Alert>
                )}
                
                {settingsLoading ? (
                  <div className="py-4 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-buzzaroo-green"></div>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitSettings)} className="space-y-6">
                      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-md font-medium">Doelinstellingen</h3>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                              <span className="sr-only">Schakelen</span>
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        
                        <CollapsibleContent className="pt-4 space-y-4">
                          <FormField
                            control={form.control}
                            name="target_all"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Doel Totaal</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    value={field.value === null ? '' : field.value}
                                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Doelwaarde voor alle documenten
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="target_invoice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Doel Facturen</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    value={field.value === null ? '' : field.value}
                                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Doelwaarde voor facturen
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="target_top"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Doel Top</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    value={field.value === null ? '' : field.value}
                                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Doelwaarde voor top documenten
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                      
                      <Button type="submit" className="mt-4">
                        Instellingen Opslaan
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="user-management" className="mt-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-medium mb-4">Gebruikersbeheer</h2>
                
                {loading ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-buzzaroo-green"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium text-gray-600">E-mail</th>
                          <th className="pb-2 font-medium text-gray-600">Naam</th>
                          <th className="pb-2 font-medium text-gray-600">Rol</th>
                          <th className="pb-2 font-medium text-gray-600">Acties</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} className="border-b last:border-0">
                            <td className="py-3">{user.email}</td>
                            <td className="py-3">{user.fullName || '-'}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => toggleUserRole(user.id, user.role)}
                              >
                                {user.role === 'admin' ? 'Admin Rechten Intrekken' : 'Admin Maken'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Settings;
