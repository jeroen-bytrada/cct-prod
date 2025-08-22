-- Harden cct_customers view access without breaking app
-- 1) Make the view a security-barrier to prevent predicate pushdown leaks
ALTER VIEW public.cct_customers SET (security_barrier = on);

-- 2) Revoke all access from common API roles so the view cannot be queried directly
DO $$
BEGIN
  -- Revoke from PUBLIC (all roles)
  REVOKE ALL ON public.cct_customers FROM PUBLIC;
  -- Revoke from Supabase API roles explicitly
  REVOKE ALL ON public.cct_customers FROM anon;
  REVOKE ALL ON public.cct_customers FROM authenticated;
EXCEPTION WHEN undefined_object THEN
  -- Some roles might not exist in self-hosted setups; ignore
  NULL;
END $$;