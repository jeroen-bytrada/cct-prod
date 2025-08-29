-- Add wh_run field to settings table for webhook URL
ALTER TABLE public.settings 
ADD COLUMN wh_run TEXT;