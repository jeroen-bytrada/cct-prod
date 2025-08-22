-- Secure cct_customers with RLS and admin-only policies

-- 1) Enable Row Level Security
ALTER TABLE public.cct_customers ENABLE ROW LEVEL SECURITY;

-- 2) Create admin-only policies (idempotent guards)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can view all cct_customers'
  ) THEN
    CREATE POLICY "Admins can view all cct_customers"
      ON public.cct_customers
      FOR SELECT
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can insert cct_customers'
  ) THEN
    CREATE POLICY "Admins can insert cct_customers"
      ON public.cct_customers
      FOR INSERT
      WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can update cct_customers'
  ) THEN
    CREATE POLICY "Admins can update cct_customers"
      ON public.cct_customers
      FOR UPDATE
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can delete cct_customers'
  ) THEN
    CREATE POLICY "Admins can delete cct_customers"
      ON public.cct_customers
      FOR DELETE
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END
$$;