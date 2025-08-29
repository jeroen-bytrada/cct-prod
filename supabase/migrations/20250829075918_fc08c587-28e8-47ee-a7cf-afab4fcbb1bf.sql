-- Allow both user and admin roles to access customer data
BEGIN;

-- Create policy for users and admins to view customers
CREATE POLICY "Users and admins can view customers"
ON public.customers
FOR SELECT
USING (
  has_role(auth.uid(), 'user'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create policy for users and admins to update customers
CREATE POLICY "Users and admins can update customers"
ON public.customers
FOR UPDATE
USING (
  has_role(auth.uid(), 'user'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'user'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

COMMIT;