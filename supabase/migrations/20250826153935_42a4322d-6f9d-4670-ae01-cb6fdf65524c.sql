-- Secure cct_customers without breaking existing functionality
-- This migration handles both cases (table or view) safely.

DO $$
DECLARE
  obj_kind "char";
BEGIN
  SELECT c.relkind
  INTO obj_kind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'cct_customers';

  -- If it's a VIEW or MATERIALIZED VIEW: RLS doesn't apply, so lock down grants
  IF obj_kind IN ('v', 'm') THEN
    -- Make view a security barrier to prevent predicate pushdown/leaks (ignore if not supported)
    BEGIN
      EXECUTE 'ALTER VIEW public.cct_customers SET (security_barrier = on)';
    EXCEPTION WHEN others THEN
      NULL;
    END;

    -- Revoke any broad access and only allow service_role (server-side)
    BEGIN EXECUTE 'REVOKE ALL ON public.cct_customers FROM PUBLIC'; EXCEPTION WHEN undefined_table THEN NULL; END;
    BEGIN EXECUTE 'REVOKE ALL ON public.cct_customers FROM anon'; EXCEPTION WHEN undefined_table THEN NULL; END;
    BEGIN EXECUTE 'REVOKE ALL ON public.cct_customers FROM authenticated'; EXCEPTION WHEN undefined_table THEN NULL; END;
    BEGIN EXECUTE 'GRANT SELECT ON public.cct_customers TO service_role'; EXCEPTION WHEN undefined_table THEN NULL; END;

  -- If it's a TABLE: enable RLS and add admin-only policies
  ELSIF obj_kind = 'r' THEN
    EXECUTE 'ALTER TABLE public.cct_customers ENABLE ROW LEVEL SECURITY';

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can view all cct_customers'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can view all cct_customers" ON public.cct_customers FOR SELECT USING (public.has_role(auth.uid(), ''admin''::public.app_role))';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can insert cct_customers'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can insert cct_customers" ON public.cct_customers FOR INSERT WITH CHECK (public.has_role(auth.uid(), ''admin''::public.app_role))';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can update cct_customers'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can update cct_customers" ON public.cct_customers FOR UPDATE USING (public.has_role(auth.uid(), ''admin''::public.app_role))';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'cct_customers' AND policyname = 'Admins can delete cct_customers'
    ) THEN
      EXECUTE 'CREATE POLICY "Admins can delete cct_customers" ON public.cct_customers FOR DELETE USING (public.has_role(auth.uid(), ''admin''::public.app_role))';
    END IF;
  END IF;
END $$;