-- Enable Row Level Security on customer_documents table
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all customer documents
CREATE POLICY "Admins can view all customer documents" 
ON public.customer_documents 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy for admins to insert customer documents
CREATE POLICY "Admins can insert customer documents" 
ON public.customer_documents 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy for admins to update customer documents
CREATE POLICY "Admins can update customer documents" 
ON public.customer_documents 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy for admins to delete customer documents
CREATE POLICY "Admins can delete customer documents" 
ON public.customer_documents 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on other sensitive tables as well for comprehensive security

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all customers" 
ON public.customers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update customers" 
ON public.customers 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete customers" 
ON public.customers 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on cct_stats_hist table
ALTER TABLE public.cct_stats_hist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all stats history" 
ON public.cct_stats_hist 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert stats history" 
ON public.cct_stats_hist 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all settings" 
ON public.settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings" 
ON public.settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));