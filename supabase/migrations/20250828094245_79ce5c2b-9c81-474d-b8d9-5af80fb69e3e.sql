-- Fix RLS policy for customers table to ensure proper UPDATE permissions
-- The error suggests there's a row-level security violation for null hint/message columns

-- First, let's make sure there are no conflicting policies
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;

-- Create a proper policy that allows authenticated users to update customer records
CREATE POLICY "Authenticated users can update customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Also ensure that the profile lookup in updateCustomerLastUpdate works
-- by allowing authenticated users to read profiles for the full_name field
DROP POLICY IF EXISTS "Users can view profiles for updates" ON public.profiles;

CREATE POLICY "Users can view profiles for updates"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);