-- Phase 1: Protect exposed tables with RLS and admin-only policies
-- Enable RLS on cct_customers and cct_stats if not already enabled
DO $$
BEGIN
  IF NOT (
    SELECT relrowsecurity FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'cct_customers'
  ) THEN
    EXECUTE 'ALTER TABLE public.cct_customers ENABLE ROW LEVEL SECURITY';
  END IF;

  IF NOT (
    SELECT relrowsecurity FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'cct_stats'
  ) THEN
    EXECUTE 'ALTER TABLE public.cct_stats ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Drop existing overly-permissive policies if any (safe no-op if they don't exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='cct_customers'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view cct_customers" ON public.cct_customers';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can modify cct_customers" ON public.cct_customers';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='cct_stats'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view cct_stats" ON public.cct_stats';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can modify cct_stats" ON public.cct_stats';
  END IF;
END $$;

-- Create minimal, correct admin-only policies
CREATE POLICY "Admins can view cct_customers"
ON public.cct_customers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view cct_stats"
ON public.cct_stats
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Optionally, restrict mutations to admins only (keeps future-proof and explicit)
CREATE POLICY "Admins can modify cct_customers"
ON public.cct_customers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can modify cct_stats"
ON public.cct_stats
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));