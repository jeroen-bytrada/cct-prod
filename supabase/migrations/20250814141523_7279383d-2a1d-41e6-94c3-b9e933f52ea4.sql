-- Drop the existing views since they can't have RLS
DROP VIEW IF EXISTS public.cct_customers;
DROP VIEW IF EXISTS public.cct_stats;

-- Create security definer functions that replace the views with proper access control
CREATE OR REPLACE FUNCTION public.get_cct_customers()
RETURNS TABLE (
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
    is_active boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Only allow access to admin users
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
    c.is_active
  FROM customers c
  WHERE has_role(auth.uid(), 'admin'::app_role);
$$;

CREATE OR REPLACE FUNCTION public.get_cct_stats()
RETURNS TABLE (
    id integer,
    total_in_proces bigint,
    total_other bigint,
    total bigint,
    total_in_proces_15 bigint,
    total_other_15 bigint,
    total_15 bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Only allow access to admin users
  SELECT 
    1 AS id,
    (SELECT sum(c.cs_documents_in_process) FROM customers c WHERE c.is_active = true AND has_role(auth.uid(), 'admin'::app_role)) AS total_in_proces,
    (SELECT sum(c.cs_documents_other) FROM customers c WHERE c.is_active = true AND has_role(auth.uid(), 'admin'::app_role)) AS total_other,
    (SELECT sum(c.cs_documents_in_process + c.cs_documents_other) FROM customers c WHERE c.is_active = true AND has_role(auth.uid(), 'admin'::app_role)) AS total,
    COALESCE((
      SELECT sum(top_values.val) 
      FROM (
        SELECT c.cs_documents_in_process AS val
        FROM customers c
        WHERE c.is_active = true 
          AND c.cs_documents_in_process IS NOT NULL 
          AND has_role(auth.uid(), 'admin'::app_role)
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
          AND has_role(auth.uid(), 'admin'::app_role)
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
          AND has_role(auth.uid(), 'admin'::app_role)
        ORDER BY (c.cs_documents_in_process + c.cs_documents_other) DESC
        LIMIT (SELECT s.topx FROM settings s LIMIT 1)
      ) top_values
    ), 0::bigint) AS total_15
  WHERE has_role(auth.uid(), 'admin'::app_role);
$$;

-- Recreate views that use the security definer functions
CREATE VIEW public.cct_customers AS
SELECT * FROM public.get_cct_customers();

CREATE VIEW public.cct_stats AS  
SELECT * FROM public.get_cct_stats();