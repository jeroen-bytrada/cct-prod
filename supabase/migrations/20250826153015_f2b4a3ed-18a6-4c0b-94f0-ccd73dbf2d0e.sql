-- Secure cct_customers table by enabling RLS and adding admin-only policies
-- IMPORTANT: This migration only targets cct_customers to avoid impacting other functionality

-- 1) Enable Row Level Security
ALTER TABLE public.cct_customers ENABLE ROW LEVEL SECURITY;

-- 2) Create admin-only policies (consistent with existing customers table policies)
DO $$
BEGIN
  -- SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can view all cct_customers'
  ) THEN
    CREATE POLICY "Admins can view all cct_customers"
    ON public.cct_customers
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can insert cct_customers'
  ) THEN
    CREATE POLICY "Admins can insert cct_customers"
    ON public.cct_customers
    FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can update cct_customers'
  ) THEN
    CREATE POLICY "Admins can update cct_customers"
    ON public.cct_customers
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  -- DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can delete cct_customers'
  ) THEN
    CREATE POLICY "Admins can delete cct_customers"
    ON public.cct_customers
    FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;