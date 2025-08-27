-- Allow read access for all authenticated users, keep mutations admin-only
-- 1) Customers: Authenticated users can SELECT active customers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Authenticated users can view active customers'
  ) THEN
    CREATE POLICY "Authenticated users can view active customers"
    ON public.customers
    FOR SELECT
    TO authenticated
    USING (is_active = true);
  END IF;
END $$;

-- 2) Customer Documents: Authenticated users can SELECT docs for active customers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customer_documents' AND policyname = 'Authenticated users can view documents of active customers'
  ) THEN
    CREATE POLICY "Authenticated users can view documents of active customers"
    ON public.customer_documents
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.customers c
        WHERE c.id::text = customer_id::text
          AND c.is_active = true
      )
    );
  END IF;
END $$;

-- 3) Stats history: Authenticated users can SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cct_stats_hist' AND policyname = 'Authenticated users can view stats history'
  ) THEN
    CREATE POLICY "Authenticated users can view stats history"
    ON public.cct_stats_hist
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- 4) Settings: Authenticated users can SELECT (updates remain admin-only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'settings' AND policyname = 'Authenticated users can view settings'
  ) THEN
    CREATE POLICY "Authenticated users can view settings"
    ON public.settings
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- 5) Relax RPCs to rely on RLS instead of explicit admin checks
-- get_cct_customers: remove has_role() condition; rely on table RLS (returns only active rows to authenticated users)
CREATE OR REPLACE FUNCTION public.get_cct_customers()
RETURNS TABLE(
  id character varying,
  created_at timestamp with time zone,
  customer_name character varying,
  administration_name character varying,
  administration_mail character varying,
  source character varying,
  source_root character varying,
  cs_last_update timestamp with time zone,
  cs_documents_in_process integer,
  cs_documents_other integer,
  cs_documents_inbox integer,
  is_active boolean,
  cct_processed boolean,
  last_updated_by character varying
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    c.id,
    c.created_at,
    c.customer_name,
    c.administration_name,
    c.administration_mail,
    c.source,
    c.source_root,
    c.cs_last_update,
    c.cs_documents_in_process,
    c.cs_documents_other,
    c.cs_documents_inbox,
    c.is_active,
    c.cct_processed,
    c.last_updated_by
  FROM customers c
  WHERE c.is_active = true;
$function$;

-- get_cct_stats: remove has_role() checks; rely on RLS for customers and settings
CREATE OR REPLACE FUNCTION public.get_cct_stats()
RETURNS TABLE(
  id integer,
  total_in_proces bigint,
  total_other bigint,
  total bigint,
  total_in_proces_15 bigint,
  total_other_15 bigint,
  total_15 bigint
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    1 AS id,
    (SELECT sum(c.cs_documents_in_process) FROM customers c WHERE c.is_active = true) AS total_in_proces,
    (SELECT sum(c.cs_documents_other) FROM customers c WHERE c.is_active = true) AS total_other,
    (SELECT sum(c.cs_documents_in_process + c.cs_documents_other) FROM customers c WHERE c.is_active = true) AS total,
    COALESCE((
      SELECT sum(top_values.val) 
      FROM (
        SELECT c.cs_documents_in_process AS val
        FROM customers c
        WHERE c.is_active = true 
          AND c.cs_documents_in_process IS NOT NULL 
        ORDER BY c.cs_documents_in_process DESC
        LIMIT (SELECT s.topx FROM settings s LIMIT 1)
      ) top_values
    ), 0::bigint) AS total_in_proces_15,
    COALESCE((
      SELECT sum(top_values.val) 
      FROM (
        SELECT c.cs_documents_other AS val
        FROM customers c
        WHERE c.is_active = true 
          AND c.cs_documents_other IS NOT NULL 
        ORDER BY c.cs_documents_other DESC
        LIMIT (SELECT s.topx FROM settings s LIMIT 1)
      ) top_values
    ), 0::bigint) AS total_other_15,
    COALESCE((
      SELECT sum(top_values.val) 
      FROM (
        SELECT (c.cs_documents_in_process + c.cs_documents_other) AS val
        FROM customers c
        WHERE c.is_active = true 
          AND c.cs_documents_in_process IS NOT NULL 
          AND c.cs_documents_other IS NOT NULL
        ORDER BY (c.cs_documents_in_process + c.cs_documents_other) DESC
        LIMIT (SELECT s.topx FROM settings s LIMIT 1)
      ) top_values
    ), 0::bigint) AS total_15;
$function$;