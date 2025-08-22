-- Fix function search path security issues
-- Update insert_cct_stats_hist_on_customers_change function to have proper search_path
CREATE OR REPLACE FUNCTION public.insert_cct_stats_hist_on_customers_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO cct_stats_hist (total_in_proces, total_other, total, total_in_proces_15, total_other_15, total_15) 
    SELECT 
        total_in_proces, 
        total_other, 
        total, 
        total_in_process_15, 
        total_other_15, 
        total_15 
    FROM 
        cct_stats;
 
  RETURN NEW;
END;
$function$;

-- Update update_cct_stats_hist function to have proper search_path
CREATE OR REPLACE FUNCTION public.update_cct_stats_hist()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO cct_stats_hist (total_in_proces, total_other, total, total_in_proces_15, total_other_15, total_15) 
    SELECT 
        total_in_proces, 
        total_other, 
        total, 
        total_in_process_15, 
        total_other_15, 
        total_15 
    FROM 
        cct_stats;
 
  RETURN NEW;
END;
$function$;