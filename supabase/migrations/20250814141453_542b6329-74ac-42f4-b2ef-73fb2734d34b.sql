-- Enable Row Level Security on cct_customers view
ALTER VIEW public.cct_customers SET (security_barrier = true);
ALTER VIEW public.cct_customers ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view customer data
CREATE POLICY "Admins can view all cct_customers" 
ON public.cct_customers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable Row Level Security on cct_stats view  
ALTER VIEW public.cct_stats SET (security_barrier = true);
ALTER VIEW public.cct_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view statistics
CREATE POLICY "Admins can view all cct_stats" 
ON public.cct_stats 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));