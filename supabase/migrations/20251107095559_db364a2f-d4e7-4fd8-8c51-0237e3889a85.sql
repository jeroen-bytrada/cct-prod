-- Update get_cct_stats function to include cs_documents_inbox in calculations
CREATE OR REPLACE FUNCTION public.get_cct_stats()
 RETURNS TABLE(id integer, total_in_proces bigint, total_other bigint, total bigint, total_in_proces_15 bigint, total_other_15 bigint, total_15 bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT 
    1 AS id,
    (SELECT sum(c.cs_documents_in_process) FROM customers c WHERE c.is_active = true) AS total_in_proces,
    (SELECT sum(c.cs_documents_other) FROM customers c WHERE c.is_active = true) AS total_other,
    (SELECT sum(c.cs_documents_in_process + c.cs_documents_other + COALESCE(c.cs_documents_inbox, 0)) FROM customers c WHERE c.is_active = true) AS total,
    COALESCE((
      SELECT sum(top_values.val) 
      FROM (
        SELECT c.cs_documents_in_process AS val
        FROM customers c
        WHERE c.is_active = true 
          AND c.cs_documents_in_process IS NOT NULL 
        ORDER BY c.cs_documents_in_process DESC
        LIMIT (SELECT s.topx FROM settings s LIMIT 1)
      ) top_values
    ), 0::bigint) AS total_in_proces_15,
    COALESCE((
      SELECT sum(top_values.val) 
      FROM (
        SELECT c.cs_documents_other AS val
        FROM customers c
        WHERE c.is_active = true 
          AND c.cs_documents_other IS NOT NULL 
        ORDER BY c.cs_documents_other DESC
        LIMIT (SELECT s.topx FROM settings s LIMIT 1)
      ) top_values
    ), 0::bigint) AS total_other_15,
    COALESCE((
      SELECT sum(top_values.val) 
      FROM (
        SELECT (c.cs_documents_in_process + c.cs_documents_other + COALESCE(c.cs_documents_inbox, 0)) AS val
        FROM customers c
        WHERE c.is_active = true
        ORDER BY (c.cs_documents_in_process + c.cs_documents_other + COALESCE(c.cs_documents_inbox, 0)) DESC
        LIMIT (SELECT s.topx FROM settings s LIMIT 1)
      ) top_values
    ), 0::bigint) AS total_15;
$function$;