-- Allow authenticated users to UPDATE customers table (not just admins)
-- This enables regular users to update customer data, toggle flags, and update timestamps

DROP POLICY IF EXISTS "Admins can update customers" ON public.customers;

CREATE POLICY "Authenticated users can update customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);