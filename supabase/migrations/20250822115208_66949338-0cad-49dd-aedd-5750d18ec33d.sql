-- Recreate cct_customers view to include cct_processed
DROP VIEW IF EXISTS public.cct_customers;

CREATE VIEW public.cct_customers AS
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
  c.is_active,
  c.cct_processed,
  COALESCE(c.cs_documents_in_process, 0) + COALESCE(c.cs_documents_other, 0) AS cs_documents_total,
  (COALESCE(c.cs_documents_in_process, 0) + COALESCE(c.cs_documents_other, 0))::text AS str_cs_documents_total
FROM public.customers c;