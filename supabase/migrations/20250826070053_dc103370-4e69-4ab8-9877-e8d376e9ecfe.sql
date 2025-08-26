-- Phase 1c: Fix security definer views by recreating them with SECURITY INVOKER
-- This resolves the security linter issue by making views respect RLS

-- First, let's check if the views exist and drop them
DROP VIEW IF EXISTS public.cct_customers;
DROP VIEW IF EXISTS public.cct_stats;

-- Recreate cct_customers view with SECURITY INVOKER
CREATE VIEW public.cct_customers
WITH (security_invoker=on)
AS SELECT * FROM get_cct_customers();

-- Recreate cct_stats view with SECURITY INVOKER  
CREATE VIEW public.cct_stats
WITH (security_invoker=on)
AS SELECT * FROM get_cct_stats();