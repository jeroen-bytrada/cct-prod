-- Update function to only return active customers
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
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
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
    c.is_active
  FROM customers c
  WHERE has_role(auth.uid(), 'admin'::app_role)
    AND c.is_active = true;
$$;