

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'user'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_cct_customers"() RETURNS TABLE("id" character varying, "created_at" timestamp with time zone, "customer_name" character varying, "administration_name" character varying, "administration_mail" character varying, "source" character varying, "source_root" character varying, "cs_last_update" timestamp with time zone, "cs_documents_in_process" integer, "cs_documents_other" integer, "is_active" boolean)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  -- Only allow access to admin users
  SELECT 
    c.id,
    c.created_at,
    c.customer_name,
    c.administration_name,
    c.administration_mail,
    c.source,
    c.source_root,
    c.cs_last_update,
    c.cs_documents_in_process,
    c.cs_documents_other,
    c.is_active
  FROM customers c
  WHERE has_role(auth.uid(), 'admin'::app_role);
$$;


ALTER FUNCTION "public"."get_cct_customers"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_cct_stats"() RETURNS TABLE("id" integer, "total_in_proces" bigint, "total_other" bigint, "total" bigint, "total_in_proces_15" bigint, "total_other_15" bigint, "total_15" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  -- Only allow access to admin users
  SELECT 
    1 AS id,
    (SELECT sum(c.cs_documents_in_process) FROM customers c WHERE c.is_active = true AND has_role(auth.uid(), 'admin'::app_role)) AS total_in_proces,
    (SELECT sum(c.cs_documents_other) FROM customers c WHERE c.is_active = true AND has_role(auth.uid(), 'admin'::app_role)) AS total_other,
    (SELECT sum(c.cs_documents_in_process + c.cs_documents_other) FROM customers c WHERE c.is_active = true AND has_role(auth.uid(), 'admin'::app_role)) AS total,
    COALESCE((
      SELECT sum(top_values.val) 
      FROM (
        SELECT c.cs_documents_in_process AS val
        FROM customers c
        WHERE c.is_active = true 
          AND c.cs_documents_in_process IS NOT NULL 
          AND has_role(auth.uid(), 'admin'::app_role)
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
          AND has_role(auth.uid(), 'admin'::app_role)
        ORDER BY c.cs_documents_other DESC
        LIMIT (SELECT s.topx FROM settings s LIMIT 1)
      ) top_values
    ), 0::bigint) AS total_other_15,
    COALESCE((
      SELECT sum(top_values.val) 
      FROM (
        SELECT (c.cs_documents_in_process + c.cs_documents_other) AS val
        FROM customers c
        WHERE c.is_active = true 
          AND c.cs_documents_in_process IS NOT NULL 
          AND c.cs_documents_other IS NOT NULL
          AND has_role(auth.uid(), 'admin'::app_role)
        ORDER BY (c.cs_documents_in_process + c.cs_documents_other) DESC
        LIMIT (SELECT s.topx FROM settings s LIMIT 1)
      ) top_values
    ), 0::bigint) AS total_15
  WHERE has_role(auth.uid(), 'admin'::app_role);
$$;


ALTER FUNCTION "public"."get_cct_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Add default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_cct_stats_hist_on_customers_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."insert_cct_stats_hist_on_customers_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_cct_stats_hist_on_view_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    INSERT INTO cct_stats_hist (total_in_proces, total_other, total, total_in_proces_15, total_other_15, total_15) 
    VALUES (NEW.total_in_proces, NEW.total_other, NEW.total, NEW.total_in_proces_15, NEW.total_other_15, NEW.total_15);

    RETURN NEW;  -- This is necessary to indicate the operation should proceed
END;
$$;


ALTER FUNCTION "public"."insert_cct_stats_hist_on_view_update"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cct_stats_hist" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "total_in_proces" bigint,
    "total_other" bigint,
    "total" bigint,
    "total_in_proces_15" bigint,
    "total_other_15" bigint,
    "total_15" bigint
);


ALTER TABLE "public"."cct_stats_hist" OWNER TO "postgres";


ALTER TABLE "public"."cct_stats_hist" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cct_stats_hist_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."customer_documents" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone,
    "customer_id" character varying,
    "document_name" "text",
    "document_path" "text",
    "document_type" "text",
    "uuid" "text"
);


ALTER TABLE "public"."customer_documents" OWNER TO "postgres";


ALTER TABLE "public"."customer_documents" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."customer_documents_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone,
    "customer_name" character varying(255),
    "administration_name" character varying(255),
    "administration_mail" character varying(255),
    "source" character varying(255),
    "source_root" character varying(255),
    "cs_last_update" timestamp with time zone,
    "cs_documents_in_process" integer,
    "cs_documents_other" integer,
    "is_active" boolean DEFAULT false
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" bigint NOT NULL,
    "last_update_run" timestamp with time zone DEFAULT "now"() NOT NULL,
    "target_all" integer,
    "target_top" integer,
    "target_invoice" integer,
    "history_limit" integer,
    "topx" integer DEFAULT 5
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."settings" IS 'General Application Settings';



COMMENT ON COLUMN "public"."settings"."history_limit" IS 'Number of history records to display in charts';



ALTER TABLE "public"."settings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."settings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" DEFAULT 'user'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cct_stats_hist"
    ADD CONSTRAINT "cct_stats_hist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_documents"
    ADD CONSTRAINT "customer_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



CREATE INDEX "idx_customer_documents_customer_id" ON "public"."customer_documents" USING "btree" ("customer_id");



CREATE OR REPLACE TRIGGER "customers_change_trigger" AFTER UPDATE OF "last_update_run" ON "public"."settings" FOR EACH ROW EXECUTE FUNCTION "public"."insert_cct_stats_hist_on_customers_change"();



ALTER TABLE ONLY "public"."customer_documents"
    ADD CONSTRAINT "customer_documents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete customer documents" ON "public"."customer_documents" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete customers" ON "public"."customers" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete roles" ON "public"."user_roles" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert customer documents" ON "public"."customer_documents" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert customers" ON "public"."customers" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert roles" ON "public"."user_roles" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert stats history" ON "public"."cct_stats_hist" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can select all roles" ON "public"."user_roles" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update customer documents" ON "public"."customer_documents" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update customers" ON "public"."customers" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update roles" ON "public"."user_roles" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update settings" ON "public"."settings" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all customer documents" ON "public"."customer_documents" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all customers" ON "public"."customers" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all settings" ON "public"."settings" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all stats history" ON "public"."cct_stats_hist" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."cct_stats_hist" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."cct_stats_hist";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."get_cct_customers"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_cct_customers"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_cct_customers"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_cct_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_cct_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_cct_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_cct_stats_hist_on_customers_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_cct_stats_hist_on_customers_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_cct_stats_hist_on_customers_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_cct_stats_hist_on_view_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_cct_stats_hist_on_view_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_cct_stats_hist_on_view_update"() TO "service_role";


















GRANT ALL ON TABLE "public"."cct_stats_hist" TO "anon";
GRANT ALL ON TABLE "public"."cct_stats_hist" TO "authenticated";
GRANT ALL ON TABLE "public"."cct_stats_hist" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cct_stats_hist_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cct_stats_hist_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cct_stats_hist_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."customer_documents" TO "anon";
GRANT ALL ON TABLE "public"."customer_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_documents" TO "service_role";



GRANT ALL ON SEQUENCE "public"."customer_documents_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."customer_documents_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."customer_documents_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
