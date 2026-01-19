create extension if not exists "pgjwt" with schema "extensions";

drop extension if exists "pg_net";

create sequence "public"."audit_logs_id_seq";


  create table "public"."audit_logs" (
    "id" integer not null default nextval('public.audit_logs_id_seq'::regclass),
    "timestamp" timestamp without time zone default CURRENT_TIMESTAMP,
    "user_id" uuid,
    "action" text not null,
    "table_name" text not null,
    "record_id" text not null,
    "old_data" jsonb,
    "new_data" jsonb
      );


alter table "public"."audit_logs" enable row level security;


  create table "public"."company" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "user_id" uuid not null,
    "database_id" uuid,
    "description" text,
    "logo" text,
    "industry" text
      );


alter table "public"."company" enable row level security;


  create table "public"."data_bases" (
    "created_at" timestamp with time zone not null default now(),
    "connection_config" jsonb not null,
    "name" text not null,
    "user_id" uuid,
    "id" uuid not null default gen_random_uuid()
      );


alter table "public"."data_bases" enable row level security;


  create table "public"."keys" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "value" jsonb not null,
    "user_id" uuid not null default gen_random_uuid()
      );


alter table "public"."keys" enable row level security;


  create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "first_name" text not null,
    "last_name" text not null,
    "country" text not null,
    "email" text not null,
    "password_hash" text not null,
    "phone_number" text not null,
    "email_verified" boolean not null default false,
    "image" text
      );


alter table "public"."users" enable row level security;

alter sequence "public"."audit_logs_id_seq" owned by "public"."audit_logs"."id";

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX company_pkey ON public.company USING btree (id);

CREATE UNIQUE INDEX data_bases_pkey ON public.data_bases USING btree (id);

CREATE INDEX idx_audit_logs_record_id ON public.audit_logs USING btree (record_id);

CREATE INDEX idx_audit_logs_table_name ON public.audit_logs USING btree (table_name);

CREATE INDEX idx_audit_logs_table_record ON public.audit_logs USING btree (table_name, record_id);

CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs USING btree ("timestamp");

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);

CREATE UNIQUE INDEX keys_pkey ON public.keys USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."company" add constraint "company_pkey" PRIMARY KEY using index "company_pkey";

alter table "public"."data_bases" add constraint "data_bases_pkey" PRIMARY KEY using index "data_bases_pkey";

alter table "public"."keys" add constraint "keys_pkey" PRIMARY KEY using index "keys_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_user_id_fkey";

alter table "public"."company" add constraint "company_database_id_fkey" FOREIGN KEY (database_id) REFERENCES public.data_bases(id) not valid;

alter table "public"."company" validate constraint "company_database_id_fkey";

alter table "public"."company" add constraint "company_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."company" validate constraint "company_user_id_fkey";

alter table "public"."data_bases" add constraint "data_bases_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."data_bases" validate constraint "data_bases_user_id_fkey";

alter table "public"."keys" add constraint "keys_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."keys" validate constraint "keys_user_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.audit_log_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    record_id text;
BEGIN
    -- Dynamically get the primary key value based on the column name passed as an argument
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        EXECUTE format('SELECT ($1).%I::text', TG_ARGV[0]) INTO record_id USING NEW;
    ELSIF TG_OP = 'DELETE' THEN
        EXECUTE format('SELECT ($1).%I::text', TG_ARGV[0]) INTO record_id USING OLD;
    END IF;

    -- Insert the log entry into audit_logs table
    INSERT INTO audit_logs (timestamp, user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
        CURRENT_TIMESTAMP,
        auth.uid(),              -- Current user's UUID (Supabase-specific)
        TG_OP,                   -- Operation: INSERT, UPDATE, or DELETE
        TG_TABLE_NAME,           -- Affected table name
        record_id,               -- Primary key of the affected row
        CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END
    );

    -- Return the appropriate row for trigger convention
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_index_stats()
 RETURNS TABLE(table_name text, index_name text, index_size bigint, usage_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    t.relname::text AS table_name,
    i.relname::text AS index_name,
    pg_relation_size(i.oid) AS index_size,
    coalesce(s.idx_scan, 0) AS usage_count
  FROM
    pg_class t
  JOIN
    pg_index x ON t.oid = x.indrelid
  JOIN
    pg_class i ON i.oid = x.indexrelid
  LEFT JOIN
    pg_stat_user_indexes s ON s.indexrelid = i.oid
  JOIN
    pg_namespace n ON n.oid = t.relnamespace
  WHERE
    n.nspname = 'public'
  ORDER BY
    t.relname,
    i.relname;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_recent_queries()
 RETURNS TABLE(query_text text, duration_ms double precision, executed_at timestamp without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    query AS query_text,
    mean_exec_time AS duration_ms,
    now() - interval '1 minute' * random() * 60 AS executed_at -- Simulated execution time
  FROM
    pg_stat_statements
  WHERE
    query NOT LIKE '%pg_stat_statements%'
    AND query NOT LIKE 'BEGIN%'
    AND query NOT LIKE 'COMMIT%'
  ORDER BY
    mean_exec_time DESC
  LIMIT 10;
EXCEPTION
  WHEN undefined_table THEN
    -- If pg_stat_statements doesn't exist, return empty result
    RETURN;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_storage_sizes()
 RETURNS TABLE(bucket_name text, size_bytes bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    s.name AS bucket_name,
    COALESCE(SUM(o.metadata->>'size')::bigint, 0) AS size_bytes
  FROM
    storage.buckets s
  LEFT JOIN
    storage.objects o ON s.id = o.bucket_id
  GROUP BY
    s.name
  ORDER BY
    size_bytes DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_table_row_counts()
 RETURNS TABLE(table_name text, row_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  query text;
  rec record;
BEGIN
  CREATE TEMP TABLE temp_counts(table_name text, row_count bigint) ON COMMIT DROP;
  
  FOR rec IN 
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    query := 'INSERT INTO temp_counts SELECT ''' || rec.table_name || ''', COUNT(*) FROM public.' || rec.table_name;
    EXECUTE query;
  END LOOP;
  
  RETURN QUERY SELECT * FROM temp_counts ORDER BY table_name;
END;
$function$
;

grant delete on table "public"."audit_logs" to "anon";

grant insert on table "public"."audit_logs" to "anon";

grant references on table "public"."audit_logs" to "anon";

grant select on table "public"."audit_logs" to "anon";

grant trigger on table "public"."audit_logs" to "anon";

grant truncate on table "public"."audit_logs" to "anon";

grant update on table "public"."audit_logs" to "anon";

grant delete on table "public"."audit_logs" to "authenticated";

grant insert on table "public"."audit_logs" to "authenticated";

grant references on table "public"."audit_logs" to "authenticated";

grant select on table "public"."audit_logs" to "authenticated";

grant trigger on table "public"."audit_logs" to "authenticated";

grant truncate on table "public"."audit_logs" to "authenticated";

grant update on table "public"."audit_logs" to "authenticated";

grant delete on table "public"."audit_logs" to "service_role";

grant insert on table "public"."audit_logs" to "service_role";

grant references on table "public"."audit_logs" to "service_role";

grant select on table "public"."audit_logs" to "service_role";

grant trigger on table "public"."audit_logs" to "service_role";

grant truncate on table "public"."audit_logs" to "service_role";

grant update on table "public"."audit_logs" to "service_role";

grant delete on table "public"."company" to "anon";

grant insert on table "public"."company" to "anon";

grant references on table "public"."company" to "anon";

grant select on table "public"."company" to "anon";

grant trigger on table "public"."company" to "anon";

grant truncate on table "public"."company" to "anon";

grant update on table "public"."company" to "anon";

grant delete on table "public"."company" to "authenticated";

grant insert on table "public"."company" to "authenticated";

grant references on table "public"."company" to "authenticated";

grant select on table "public"."company" to "authenticated";

grant trigger on table "public"."company" to "authenticated";

grant truncate on table "public"."company" to "authenticated";

grant update on table "public"."company" to "authenticated";

grant delete on table "public"."company" to "service_role";

grant insert on table "public"."company" to "service_role";

grant references on table "public"."company" to "service_role";

grant select on table "public"."company" to "service_role";

grant trigger on table "public"."company" to "service_role";

grant truncate on table "public"."company" to "service_role";

grant update on table "public"."company" to "service_role";

grant delete on table "public"."data_bases" to "anon";

grant insert on table "public"."data_bases" to "anon";

grant references on table "public"."data_bases" to "anon";

grant select on table "public"."data_bases" to "anon";

grant trigger on table "public"."data_bases" to "anon";

grant truncate on table "public"."data_bases" to "anon";

grant update on table "public"."data_bases" to "anon";

grant delete on table "public"."data_bases" to "authenticated";

grant insert on table "public"."data_bases" to "authenticated";

grant references on table "public"."data_bases" to "authenticated";

grant select on table "public"."data_bases" to "authenticated";

grant trigger on table "public"."data_bases" to "authenticated";

grant truncate on table "public"."data_bases" to "authenticated";

grant update on table "public"."data_bases" to "authenticated";

grant delete on table "public"."data_bases" to "service_role";

grant insert on table "public"."data_bases" to "service_role";

grant references on table "public"."data_bases" to "service_role";

grant select on table "public"."data_bases" to "service_role";

grant trigger on table "public"."data_bases" to "service_role";

grant truncate on table "public"."data_bases" to "service_role";

grant update on table "public"."data_bases" to "service_role";

grant delete on table "public"."keys" to "anon";

grant insert on table "public"."keys" to "anon";

grant references on table "public"."keys" to "anon";

grant select on table "public"."keys" to "anon";

grant trigger on table "public"."keys" to "anon";

grant truncate on table "public"."keys" to "anon";

grant update on table "public"."keys" to "anon";

grant delete on table "public"."keys" to "authenticated";

grant insert on table "public"."keys" to "authenticated";

grant references on table "public"."keys" to "authenticated";

grant select on table "public"."keys" to "authenticated";

grant trigger on table "public"."keys" to "authenticated";

grant truncate on table "public"."keys" to "authenticated";

grant update on table "public"."keys" to "authenticated";

grant delete on table "public"."keys" to "service_role";

grant insert on table "public"."keys" to "service_role";

grant references on table "public"."keys" to "service_role";

grant select on table "public"."keys" to "service_role";

grant trigger on table "public"."keys" to "service_role";

grant truncate on table "public"."keys" to "service_role";

grant update on table "public"."keys" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

CREATE TRIGGER audit_documents AFTER INSERT OR DELETE OR UPDATE ON public.company FOR EACH ROW EXECUTE FUNCTION public.audit_log_func('id');

CREATE TRIGGER audit_documents AFTER INSERT OR DELETE OR UPDATE ON public.data_bases FOR EACH ROW EXECUTE FUNCTION public.audit_log_func('id');


