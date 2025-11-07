-- Fix security issue: Restrict customer data to admin-only access
-- Remove the policies that allow regular users to view customer emails
DROP POLICY IF EXISTS "Users and admins can view customers" ON customers;
DROP POLICY IF EXISTS "Users and admins can update customers" ON customers;

-- Create admin-only SELECT policy for customers table
-- This prevents regular users from accessing sensitive customer email addresses
CREATE POLICY "Only admins can view customers"
ON customers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep admin-only UPDATE policy
CREATE POLICY "Only admins can update customers"
ON customers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));