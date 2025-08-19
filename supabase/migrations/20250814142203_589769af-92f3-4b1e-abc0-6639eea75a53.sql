-- Fix Function Search Path Mutable security warning
-- Update functions to explicitly set search_path to 'public'

-- Update has_role function with explicit search path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

-- Update insert_cct_stats_hist_on_view_update trigger function with explicit search path
CREATE OR REPLACE FUNCTION public.insert_cct_stats_hist_on_view_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO cct_stats_hist (total_in_proces, total_other, total, total_in_proces_15, total_other_15, total_15) 
    VALUES (NEW.total_in_proces, NEW.total_other, NEW.total, NEW.total_in_proces_15, NEW.total_other_15, NEW.total_15);

    RETURN NEW;  -- This is necessary to indicate the operation should proceed
END;
$function$;

-- Update insert_cct_stats_hist_on_customers_change trigger function with explicit search path
CREATE OR REPLACE FUNCTION public.insert_cct_stats_hist_on_customers_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO cct_stats_hist (total_in_proces, total_other, total, total_in_proces_15, total_other_15, total_15) 
    SELECT 
        total_in_proces, 
        total_other, 
        total, 
        total_in_proces_15, 
        total_other_15, 
        total_15 
    FROM 
        cct_stats;

    RETURN NEW;  -- This is necessary to indicate the operation should proceed
END;
$function$;