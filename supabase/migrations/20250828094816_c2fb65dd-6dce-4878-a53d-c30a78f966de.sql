-- Fix critical security vulnerability: Remove overly permissive profile access
-- Replace with proper user-specific access control

-- Remove the overly permissive policy that allows any user to see all profiles
DROP POLICY IF EXISTS "Users can view profiles for updates" ON public.profiles;

-- The existing "Users can view their own profile" policy should be sufficient
-- Let's ensure it exists and is properly configured
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a secure policy that only allows users to see their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Ensure users can still update their own profile (this should already exist)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);