-- Remove the insecure view approach entirely
-- Application should use the customers table directly with proper RLS policies

DROP VIEW IF EXISTS public.cct_customers_secure;