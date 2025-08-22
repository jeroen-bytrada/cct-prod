-- Backfill last_updated_by for existing customers where it's NULL
UPDATE public.customers
SET last_updated_by = 'CCT'
WHERE last_updated_by IS NULL;