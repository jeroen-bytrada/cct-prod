-- Ensure authenticated users can update customers (e.g., toggle is_active)
-- 1) Drop existing UPDATE policy to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;

-- 2) Create a permissive UPDATE policy for authenticated users
CREATE POLICY "Authenticated users can update customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
