-- Fix security issue by replacing broad RLS policy with secure RPC functions
BEGIN;

-- Drop the existing policy that exposes emails
DROP POLICY IF EXISTS "Authenticated users can view profile display info" ON public.profiles;

-- Create secure function to get profile display info by user IDs (for UUIDs)
CREATE OR REPLACE FUNCTION public.get_profile_display_info_by_ids(ids uuid[])
RETURNS TABLE(id uuid, full_name text, badge_color text)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT p.id, p.full_name, p.badge_color
  FROM public.profiles p
  WHERE p.id = ANY(ids);
$$;

-- Create secure function to get profile display info by names (for legacy string names)
CREATE OR REPLACE FUNCTION public.get_profile_display_info_by_names(names text[])
RETURNS TABLE(full_name text, badge_color text)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT p.full_name, p.badge_color
  FROM public.profiles p
  WHERE p.full_name = ANY(names);
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_profile_display_info_by_ids(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_display_info_by_names(text[]) TO authenticated;

COMMIT;