
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
import { setUserRole, removeUserRole } from '@/lib/supabase';
import { MAX_HISTORY_RECORDS } from '@/lib/supabase/client';

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
  history_limit: z.coerce.number().min(5, "Minimaal 5 eenheden").max(50, "Maximaal 50 eenheden").nullable().optional()
    .transform(val => val === null ? MAX_HISTORY_RECORDS : val),
  topx: z.coerce.number().min(1, "Minimaal 1").max(100, "Maximaal 100").nullable().optional()
    .transform(val => val === null ? 5 : val),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const Settings = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      target_all: null,
      target_invoice: null,
      target_top: null,
      history_limit: MAX_HISTORY_RECORDS,
      topx: 5,
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
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
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
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
        
        form.reset({
          target_all: data.target_all,
          target_invoice: data.target_invoice,
          target_top: data.target_top,
          history_limit: data.history_limit || MAX_HISTORY_RECORDS,
          topx: data.topx || 5,
        });
      } else {
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
      let success = false;
      
      if (currentRole === 'admin') {
        success = await removeUserRole(userId, 'admin');
        
        if (success) {
          success = await setUserRole(userId, 'user');
        }
      } else {
        success = await setUserRole(userId, 'admin');
      }
      
      if (!success) {
        toast.error('Gebruikersrol wijzigen mislukt');
        return;
      }
      
      toast.success(`Gebruikersrol gewijzigd naar ${newRole}`);
      
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
      const { error } = await supabase
        .from('settings')
        .update({
          target_all: values.target_all,
          target_invoice: values.target_invoice,
          target_top: values.target_top,
          history_limit: values.history_limit,
          topx: values.topx,
        })
        .eq('id', 1);
        
      if (error) {
        console.error('Error updating settings:', error);
        toast.error('Instellingen bijwerken mislukt');
        return;
      }
      
      toast.success('Instellingen succesvol bijgewerkt');
      
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
                          <h3 className="text-md font-medium">Target instellingen</h3>
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
                                <FormLabel>Target Totaal Documenten</FormLabel>
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
                            name="target_top"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Totaal Top 1</FormLabel>
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
                          
                          <FormField
                            control={form.control}
                            name="target_invoice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Totaal Snelstart Facturen</FormLabel>
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
                        </CollapsibleContent>
                      </Collapsible>
                      
                      <Collapsible open={isChartOpen} onOpenChange={setIsChartOpen} className="border rounded-md p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-md font-medium">Grafiek instellingen</h3>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className={`h-4 w-4 transition-transform ${isChartOpen ? 'rotate-180' : ''}`} />
                              <span className="sr-only">Schakelen</span>
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        
                        <CollapsibleContent className="pt-4 space-y-4">
                          <FormField
                            control={form.control}
                            name="history_limit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Aantal eenheden historie in grafieken</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    value={field.value === null ? MAX_HISTORY_RECORDS : field.value}
                                    onChange={e => field.onChange(e.target.value === '' ? MAX_HISTORY_RECORDS : Number(e.target.value))} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Aantal historische meetpunten dat wordt weergegeven in de grafieken (tussen 5 en 50)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="topx"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Top X</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    value={field.value === null ? 5 : field.value}
                                    onChange={e => field.onChange(e.target.value === '' ? 5 : Number(e.target.value))} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Definieer hoeveel items in de Top X worden meegenomen (tussen 1 en 100)
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
