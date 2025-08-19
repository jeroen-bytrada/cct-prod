-- Remove the security definer views that the linter flagged
DROP VIEW IF EXISTS public.cct_customers;
DROP VIEW IF EXISTS public.cct_stats;

-- The security definer functions (get_cct_customers and get_cct_stats) will remain 
-- but the application code will need to call them directly instead of through views