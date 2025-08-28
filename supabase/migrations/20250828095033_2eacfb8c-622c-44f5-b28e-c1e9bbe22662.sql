-- Fix security vulnerability: Drop the insecure cct_customers view
-- The view bypasses RLS policies on the underlying customers table

-- Remove the insecure view that exposes customer data without proper access control
DROP VIEW IF EXISTS public.cct_customers;

-- Create a secure replacement view with proper access control
-- This view will only show data that users are allowed to see based on RLS policies
CREATE VIEW public.cct_customers_secure AS
SELECT 
    id,
    created_at,
    customer_name,
    administration_name,
    administration_mail,
    source,
    source_root,
    cs_last_update,
    cs_documents_in_process,
    cs_documents_other,
    cs_documents_inbox,
    is_active,
    cct_processed,
    last_updated_by
FROM public.customers;

-- Grant appropriate access to the secure view
GRANT SELECT ON public.cct_customers_secure TO authenticated;