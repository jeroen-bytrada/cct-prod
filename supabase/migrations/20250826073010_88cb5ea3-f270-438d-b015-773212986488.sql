-- Secure cct_customers by enabling RLS and restricting access to admins only

-- 1) Enable Row Level Security
ALTER TABLE public.cct_customers ENABLE ROW LEVEL SECURITY;

-- 2) Policies: mirror the customers table (admin-only)
CREATE POLICY "Admins can view all cct_customers"
ON public.cct_customers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert cct_customers"
ON public.cct_customers
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update cct_customers"
ON public.cct_customers
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete cct_customers"
ON public.cct_customers
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));