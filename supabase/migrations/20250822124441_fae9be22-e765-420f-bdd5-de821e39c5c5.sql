-- Enable real-time for customers table
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;

-- Enable real-time for settings table
ALTER TABLE public.settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;

-- Enable real-time for cct_stats_hist table
ALTER TABLE public.cct_stats_hist REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cct_stats_hist;

-- Enable real-time for customer_documents table
ALTER TABLE public.customer_documents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_documents;