-- Add overdue warning days threshold to settings table
ALTER TABLE settings 
ADD COLUMN overdue_warning_days integer DEFAULT 7;

COMMENT ON COLUMN settings.overdue_warning_days IS 'Number of days after which a customer update is considered overdue and shows red warning indicator';