-- Drop the view first
DROP VIEW IF EXISTS public.cct_stats;

-- Then create it with the correct column name
CREATE VIEW public.cct_stats WITH (security_invoker=on) AS
WITH settings_value AS (
  SELECT topx FROM public.settings
)
SELECT
  1 AS id,
  (SELECT SUM(cs_documents_in_process) FROM public.customers WHERE is_active = true) AS total_in_process, -- Correct spelling
  (SELECT SUM(cs_documents_other) FROM public.customers WHERE is_active = true) AS total_other,
  (SELECT SUM(cs_documents_in_process + cs_documents_other) FROM public.customers WHERE is_active = true) AS total,

  (SELECT SUM(cs_documents_in_process) FROM (
      SELECT cs_documents_in_process 
      FROM public.customers 
      WHERE is_active = true 
      ORDER BY cs_documents_in_process DESC 
      LIMIT (SELECT topx FROM settings_value)
  ) AS top_in_process) AS total_in_process_x,

  (SELECT SUM(cs_documents_other) FROM (
      SELECT cs_documents_other 
      FROM public.customers 
      WHERE is_active = true 
      ORDER BY cs_documents_other DESC 
      LIMIT (SELECT topx FROM settings_value)
  ) AS top_other) AS total_other_x,

  (SELECT SUM(combined_total) FROM (
      SELECT (cs_documents_in_process + cs_documents_other) AS combined_total
      FROM public.customers 
      WHERE is_active = true 
      ORDER BY combined_total DESC 
      LIMIT (SELECT topx FROM settings_value)
  ) AS top_total) AS total_x;