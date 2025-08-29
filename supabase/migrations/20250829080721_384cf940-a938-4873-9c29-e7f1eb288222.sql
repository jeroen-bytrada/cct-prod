-- Allow authenticated users to view basic profile info for badges
BEGIN;

-- Create policy so all authenticated users can SELECT from profiles
-- (This enables fetching full_name and badge_color for any user)
CREATE POLICY "Authenticated users can view profile display info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

COMMIT;