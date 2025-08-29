
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MAX_HISTORY_RECORDS } from '@/lib/supabase/client';

const settingsFormSchema = z.object({
  target_all: z.coerce.number().nullable().optional(),
  target_invoice: z.coerce.number().nullable().optional(),
  target_top: z.coerce.number().nullable().optional(),
  history_limit: z.coerce.number().min(5, "Minimaal 5 eenheden").max(50, "Maximaal 50 eenheden").nullable().optional()
    .transform(val => val === null ? MAX_HISTORY_RECORDS : val),
  topx: z.coerce.number().min(1, "Minimaal 1").max(100, "Maximaal 100").nullable().optional()
    .transform(val => val === null ? 5 : val),
  wh_run: z.string().url("Voer een geldige URL in").nullable().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const Settings = () => {
  const { isAdmin } = useAuth();
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
      wh_run: null,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
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
          wh_run: data.wh_run,
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

  const onSubmitSettings = async (values: SettingsFormValues) => {
    if (!isAdmin) {
      toast.error('Je hebt geen rechten om instellingen te wijzigen');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          target_all: values.target_all,
          target_invoice: values.target_invoice,
          target_top: values.target_top,
          history_limit: values.history_limit,
          topx: values.topx,
          wh_run: values.wh_run,
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
                              disabled={!isAdmin}
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
                              disabled={!isAdmin}
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
                              disabled={!isAdmin}
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
                              disabled={!isAdmin}
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
                              disabled={!isAdmin}
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

                <Collapsible className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium">Webhook instellingen</h3>
                  </div>
                  
                  <div className="pt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="wh_run"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook URL voor run trigger</FormLabel>
                          <FormControl>
                            <Input 
                              type="url" 
                              {...field} 
                              value={field.value || ''}
                              onChange={e => field.onChange(e.target.value || null)} 
                              disabled={!isAdmin}
                              placeholder="https://example.com/webhook"
                            />
                          </FormControl>
                          <FormDescription>
                            URL die wordt aangeroepen wanneer op "Laatste run" wordt geklikt
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Collapsible>
                
                {isAdmin && (
                  <Button type="submit" className="mt-4">
                    Instellingen Opslaan
                  </Button>
                )}
                
                {!isAdmin && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Je hebt alleen leesrechten voor deze instellingen. Neem contact op met een beheerder om wijzigingen aan te brengen.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </Form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
