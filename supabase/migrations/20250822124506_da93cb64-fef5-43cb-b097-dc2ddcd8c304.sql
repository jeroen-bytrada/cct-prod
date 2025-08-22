-- Enable replica identity for all tables (this is safe to run multiple times)
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.settings REPLICA IDENTITY FULL;
ALTER TABLE public.cct_stats_hist REPLICA IDENTITY FULL;
ALTER TABLE public.customer_documents REPLICA IDENTITY FULL;

-- Add tables to realtime publication only if not already present
DO $$
BEGIN
    -- Add customers table if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'customers'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
    END IF;

    -- Add settings table if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
    END IF;

    -- Add cct_stats_hist table if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'cct_stats_hist'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cct_stats_hist;
    END IF;

    -- Add customer_documents table if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'customer_documents'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_documents;
    END IF;
END $$;