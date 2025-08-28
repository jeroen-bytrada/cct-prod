-- Fix critical security vulnerability: Enable RLS on cct_customers table
-- and create appropriate access control policies

-- Enable Row Level Security on the cct_customers table
ALTER TABLE public.cct_customers ENABLE ROW LEVEL SECURITY;

-- Create policies similar to the customers table for consistency

-- Policy 1: Admins can view all customer records
CREATE POLICY "Admins can view all cct_customers"
ON public.cct_customers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy 2: Authenticated users can only view active customers  
CREATE POLICY "Authenticated users can view active cct_customers"
ON public.cct_customers
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy 3: Admins can insert new customer records
CREATE POLICY "Admins can insert cct_customers"
ON public.cct_customers
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy 4: Authenticated users can update customer records
CREATE POLICY "Authenticated users can update cct_customers"
ON public.cct_customers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 5: Admins can delete customer records
CREATE POLICY "Admins can delete cct_customers"
ON public.cct_customers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));