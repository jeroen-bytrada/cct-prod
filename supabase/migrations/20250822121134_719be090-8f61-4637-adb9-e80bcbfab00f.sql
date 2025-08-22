-- Add badge_color field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN badge_color text DEFAULT '#e5e7eb' CHECK (badge_color ~ '^#[0-9a-fA-F]{6}$');