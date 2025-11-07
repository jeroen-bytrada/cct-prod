-- Update get_cct_customers function to allow all authenticated users
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
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $$
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
  WHERE c.is_active = true
    AND auth.uid() IS NOT NULL;
$$;

-- Update get_cct_stats function to allow all authenticated users
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
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT 
    1 AS id,
    (SELECT sum(c.cs_documents_in_process) FROM customers c WHERE c.is_active = true) AS total_in_proces,
    (SELECT sum(c.cs_documents_other) FROM customers c WHERE c.is_active = true) AS total_other,
    (SELECT sum(c.cs_documents_in_process + c.cs_documents_other + COALESCE(c.cs_documents_inbox, 0)) FROM customers c WHERE c.is_active = true) AS total,
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
        SELECT (c.cs_documents_in_process + c.cs_documents_other + COALESCE(c.cs_documents_inbox, 0)) AS val
        FROM customers c
        WHERE c.is_active = true
        ORDER BY (c.cs_documents_in_process + c.cs_documents_other + COALESCE(c.cs_documents_inbox, 0)) DESC
        LIMIT (SELECT s.topx FROM settings s LIMIT 1)
      ) top_values
    ), 0::bigint) AS total_15
  WHERE auth.uid() IS NOT NULL;
$$;

-- Drop duplicate admin-only SELECT policies on customers
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Only admins can view customers" ON public.customers;

-- Drop duplicate admin-only UPDATE policies on customers
DROP POLICY IF EXISTS "Admins can update customers" ON public.customers;
DROP POLICY IF EXISTS "Only admins can update customers" ON public.customers;

-- Create new policies for authenticated users on customers table
CREATE POLICY "Authenticated users can view customers"
ON public.customers
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create new policies for authenticated users on customer_documents table
CREATE POLICY "Authenticated users can insert customer documents"
ON public.customer_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update customer documents"
ON public.customer_documents
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete customer documents"
ON public.customer_documents
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Create new policy for authenticated users on settings table
CREATE POLICY "Authenticated users can update settings"
ON public.settings
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);