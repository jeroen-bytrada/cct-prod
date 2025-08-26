-- Phase 1: Fix RLS for views - The cct_customers and cct_stats are views, not tables
-- Views inherit RLS from underlying tables and functions
-- Since these views use SECURITY DEFINER functions, we need to ensure proper access control

-- First, let's check what tables actually exist and need RLS
-- The views cct_customers and cct_stats are already handled by the has_role() function in get_cct_customers() and get_cct_stats()

-- Let's ensure the customers table (which underlies cct_customers view) has proper RLS if it doesn't already
-- Check if customers table exists and enable RLS if needed
DO $$
BEGIN
  -- Check if customers table exists and enable RLS
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'customers' AND table_type = 'BASE TABLE'
  ) THEN
    -- Enable RLS if not already enabled
    IF NOT (
      SELECT relrowsecurity FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'customers'
    ) THEN
      EXECUTE 'ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY';
    END IF;
  END IF;
END $$;