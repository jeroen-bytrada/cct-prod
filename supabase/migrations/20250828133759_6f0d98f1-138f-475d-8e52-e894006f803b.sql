-- Fix RLS policy issue for updating customers when is_active changes
-- The issue occurs when trying to set is_active = false because the existing SELECT policy
-- only allows viewing active customers, which conflicts with the UPDATE operation

-- 1) Drop existing SELECT policy that only allows active customers
DROP POLICY IF EXISTS "Authenticated users can view active customers" ON public.customers;

-- 2) Create a new SELECT policy that allows authenticated users to view all customers
-- (not just active ones) so they can update inactive customers too
CREATE POLICY "Authenticated users can view all customers"
ON public.customers
FOR SELECT
TO authenticated
USING (true);

-- 3) Ensure the UPDATE policy is properly set (recreate to be sure)
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;

CREATE POLICY "Authenticated users can update customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);