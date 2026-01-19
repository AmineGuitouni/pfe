create extension if not exists "pgjwt" with schema "extensions";

create extension if not exists "vector" with schema "extensions";

drop extension if exists "pg_net";

create type "public"."project_status_type" as enum ('Not Started', 'In Progress', 'Completed', 'Cancelled');

create type "public"."storage_access_level" as enum ('viewer', 'editor');

create type "public"."task_status_type" as enum ('To Do', 'In Progress', 'All', 'Completed', 'Blocked');

create sequence "public"."audit_logs_id_seq";


  create table "public"."audit_logs" (
    "id" integer not null default nextval('public.audit_logs_id_seq'::regclass),
    "timestamp" timestamp without time zone default CURRENT_TIMESTAMP,
    "user_id" uuid,
    "action" text not null,
    "table_name" text not null,
    "record_id" text not null,
    "old_data" jsonb,
    "new_data" jsonb,
    "company_id" uuid default gen_random_uuid()
      );


alter table "public"."audit_logs" enable row level security;


  create table "public"."columns" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "task_status" public.task_status_type,
    "company_id" uuid not null,
    "project_id" uuid not null,
    "column_order" smallint not null default '0'::smallint
      );


alter table "public"."columns" enable row level security;


  create table "public"."command_center_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "user_id" uuid not null,
    "company_id" uuid default gen_random_uuid(),
    "mode" text not null
      );


alter table "public"."command_center_sessions" enable row level security;


  create table "public"."command_center_sessions_messages" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "content" text not null,
    "sender" text not null,
    "session_id" uuid not null,
    "content_type" character varying not null default 'text'::character varying,
    "storage_path" character varying
      );


alter table "public"."command_center_sessions_messages" enable row level security;


  create table "public"."comments" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "body" text not null,
    "user_id" uuid not null default gen_random_uuid(),
    "task_id" uuid not null default gen_random_uuid(),
    "reply_to" uuid
      );


alter table "public"."comments" enable row level security;


  create table "public"."comments_likes_dislikes" (
    "user_id" uuid not null default gen_random_uuid(),
    "like_dislike" text not null,
    "comment_id" uuid not null default gen_random_uuid()
      );


alter table "public"."comments_likes_dislikes" enable row level security;


  create table "public"."cv_informations" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null default gen_random_uuid(),
    "certifications" text[] not null,
    "education" jsonb[] not null,
    "languages" text[] not null,
    "projects" jsonb[] not null,
    "recommendedTaskTypes" text[] not null,
    "skills" jsonb[] not null,
    "strengths" text[] not null,
    "summary" text not null,
    "workExperience" jsonb[] not null
      );


alter table "public"."cv_informations" enable row level security;


  create table "public"."groups" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" character varying not null,
    "description" text not null default ''::text,
    "permissions" character varying[] not null default '{}'::character varying[],
    "company_id" uuid not null
      );


alter table "public"."groups" enable row level security;


  create table "public"."project_task_history" (
    "id" uuid not null default gen_random_uuid(),
    "updated_at" timestamp with time zone not null default now(),
    "task_id" uuid default gen_random_uuid(),
    "status" public.task_status_type not null
      );


alter table "public"."project_task_history" enable row level security;


  create table "public"."project_tasks" (
    "id" uuid not null default gen_random_uuid(),
    "difficulty_level" numeric not null default '1'::numeric,
    "title" character varying not null,
    "description" text not null,
    "project_id" uuid not null,
    "task_status" public.task_status_type not null default 'To Do'::public.task_status_type,
    "column_id" uuid,
    "checked" boolean not null default false
      );


alter table "public"."project_tasks" enable row level security;


  create table "public"."project_tasks_dependencies" (
    "main_task_id" uuid not null,
    "dependent_task_id" uuid not null
      );


alter table "public"."project_tasks_dependencies" enable row level security;


  create table "public"."project_user_tasks" (
    "user_id" uuid not null,
    "task_id" uuid not null
      );


alter table "public"."project_user_tasks" enable row level security;


  create table "public"."projects" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" character varying not null,
    "description" text not null,
    "company_id" uuid not null default gen_random_uuid(),
    "deadline" date
      );


alter table "public"."projects" enable row level security;


  create table "public"."storage_file" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "name" character varying not null,
    "path" character varying not null,
    "owner_id" uuid,
    "size" integer not null,
    "type" character varying not null,
    "folder_id" uuid
      );


alter table "public"."storage_file" enable row level security;


  create table "public"."storage_file_embedding" (
    "id" uuid not null default gen_random_uuid(),
    "file_id" uuid not null,
    "embedding" extensions.vector not null
      );


alter table "public"."storage_file_embedding" enable row level security;


  create table "public"."storage_file_user_access" (
    "user_id" uuid not null,
    "file_id" uuid not null,
    "access_level" public.storage_access_level not null
      );


alter table "public"."storage_file_user_access" enable row level security;


  create table "public"."storage_folder_user_access" (
    "user_id" uuid not null,
    "folder_id" uuid not null,
    "access_level" public.storage_access_level not null
      );


alter table "public"."storage_folder_user_access" enable row level security;


  create table "public"."storage_folders" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "name" character varying not null,
    "parent_id" uuid,
    "color" character varying,
    "owner_id" uuid
      );


alter table "public"."storage_folders" enable row level security;


  create table "public"."user_groups" (
    "user_id" uuid not null,
    "group_id" uuid not null
      );


alter table "public"."user_groups" enable row level security;


  create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "first_name" text not null,
    "last_name" text not null,
    "email" text not null,
    "password_hash" text not null,
    "country" text not null,
    "phone_number" text not null,
    "company_id" text not null,
    "cv_informations" uuid,
    "image" text
      );


alter table "public"."users" enable row level security;

alter sequence "public"."audit_logs_id_seq" owned by "public"."audit_logs"."id";

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX columns_pkey ON public.columns USING btree (id);

CREATE UNIQUE INDEX command_center_sessions_messages_pkey ON public.command_center_sessions_messages USING btree (id);

CREATE UNIQUE INDEX command_center_sessions_pkey ON public.command_center_sessions USING btree (id);

CREATE UNIQUE INDEX comments_likes_dislikes_pkey ON public.comments_likes_dislikes USING btree (user_id, comment_id);

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE UNIQUE INDEX cv_informations_pkey ON public.cv_informations USING btree (id);

CREATE UNIQUE INDEX groups_pkey ON public.groups USING btree (id);

CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs USING btree ("timestamp");

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (company_id);

CREATE UNIQUE INDEX project_task_history_pkey ON public.project_task_history USING btree (id);

CREATE UNIQUE INDEX project_tasks_dependencies_pkey ON public.project_tasks_dependencies USING btree (main_task_id, dependent_task_id);

CREATE UNIQUE INDEX project_tasks_pkey ON public.project_tasks USING btree (id);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX storage_file_embedding_pkey ON public.storage_file_embedding USING btree (id);

CREATE UNIQUE INDEX storage_file_pkey ON public.storage_file USING btree (id);

CREATE UNIQUE INDEX storage_file_user_access_pkey ON public.storage_file_user_access USING btree (user_id, file_id);

CREATE UNIQUE INDEX storage_folder_user_access_pkey ON public.storage_folder_user_access USING btree (user_id, folder_id);

CREATE UNIQUE INDEX storage_folders_pkey ON public.storage_folders USING btree (id);

CREATE UNIQUE INDEX unique_email_company ON public.users USING btree (email, company_id);

CREATE UNIQUE INDEX user_groups_pkey ON public.user_groups USING btree (user_id, group_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id, company_id);

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."columns" add constraint "columns_pkey" PRIMARY KEY using index "columns_pkey";

alter table "public"."command_center_sessions" add constraint "command_center_sessions_pkey" PRIMARY KEY using index "command_center_sessions_pkey";

alter table "public"."command_center_sessions_messages" add constraint "command_center_sessions_messages_pkey" PRIMARY KEY using index "command_center_sessions_messages_pkey";

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."comments_likes_dislikes" add constraint "comments_likes_dislikes_pkey" PRIMARY KEY using index "comments_likes_dislikes_pkey";

alter table "public"."cv_informations" add constraint "cv_informations_pkey" PRIMARY KEY using index "cv_informations_pkey";

alter table "public"."groups" add constraint "groups_pkey" PRIMARY KEY using index "groups_pkey";

alter table "public"."project_task_history" add constraint "project_task_history_pkey" PRIMARY KEY using index "project_task_history_pkey";

alter table "public"."project_tasks" add constraint "project_tasks_pkey" PRIMARY KEY using index "project_tasks_pkey";

alter table "public"."project_tasks_dependencies" add constraint "project_tasks_dependencies_pkey" PRIMARY KEY using index "project_tasks_dependencies_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."storage_file" add constraint "storage_file_pkey" PRIMARY KEY using index "storage_file_pkey";

alter table "public"."storage_file_embedding" add constraint "storage_file_embedding_pkey" PRIMARY KEY using index "storage_file_embedding_pkey";

alter table "public"."storage_file_user_access" add constraint "storage_file_user_access_pkey" PRIMARY KEY using index "storage_file_user_access_pkey";

alter table "public"."storage_folder_user_access" add constraint "storage_folder_user_access_pkey" PRIMARY KEY using index "storage_folder_user_access_pkey";

alter table "public"."storage_folders" add constraint "storage_folders_pkey" PRIMARY KEY using index "storage_folders_pkey";

alter table "public"."user_groups" add constraint "user_groups_pkey" PRIMARY KEY using index "user_groups_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."columns" add constraint "columns_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."columns" validate constraint "columns_project_id_fkey";

alter table "public"."command_center_sessions_messages" add constraint "command_center_sessions_messages_session_id_fkey" FOREIGN KEY (session_id) REFERENCES public.command_center_sessions(id) ON DELETE CASCADE not valid;

alter table "public"."command_center_sessions_messages" validate constraint "command_center_sessions_messages_session_id_fkey";

alter table "public"."comments" add constraint "comments_reply_to_fkey" FOREIGN KEY (reply_to) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_reply_to_fkey";

alter table "public"."comments" add constraint "comments_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public.project_tasks(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_task_id_fkey";

alter table "public"."comments_likes_dislikes" add constraint "comments_likes_dislikes_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."comments_likes_dislikes" validate constraint "comments_likes_dislikes_comment_id_fkey";

alter table "public"."project_task_history" add constraint "project_task_history_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public.project_tasks(id) ON DELETE CASCADE not valid;

alter table "public"."project_task_history" validate constraint "project_task_history_task_id_fkey";

alter table "public"."project_tasks" add constraint "project_tasks_column_id_fkey" FOREIGN KEY (column_id) REFERENCES public.columns(id) ON DELETE SET NULL not valid;

alter table "public"."project_tasks" validate constraint "project_tasks_column_id_fkey";

alter table "public"."project_tasks" add constraint "project_tasks_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."project_tasks" validate constraint "project_tasks_project_id_fkey";

alter table "public"."project_tasks_dependencies" add constraint "project_tasks_dependencies_dependent_task_id_fkey" FOREIGN KEY (dependent_task_id) REFERENCES public.project_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."project_tasks_dependencies" validate constraint "project_tasks_dependencies_dependent_task_id_fkey";

alter table "public"."project_tasks_dependencies" add constraint "project_tasks_dependencies_main_task_id_fkey" FOREIGN KEY (main_task_id) REFERENCES public.project_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."project_tasks_dependencies" validate constraint "project_tasks_dependencies_main_task_id_fkey";

alter table "public"."project_user_tasks" add constraint "project_user_tasks_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public.project_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."project_user_tasks" validate constraint "project_user_tasks_task_id_fkey";

alter table "public"."storage_file" add constraint "storage_file_folder_id_fkey" FOREIGN KEY (folder_id) REFERENCES public.storage_folders(id) not valid;

alter table "public"."storage_file" validate constraint "storage_file_folder_id_fkey";

alter table "public"."storage_file_embedding" add constraint "storage_file_embedding_file_id_fkey" FOREIGN KEY (file_id) REFERENCES public.storage_file(id) ON DELETE CASCADE not valid;

alter table "public"."storage_file_embedding" validate constraint "storage_file_embedding_file_id_fkey";

alter table "public"."storage_file_user_access" add constraint "storage_file_user_access_file_id_fkey" FOREIGN KEY (file_id) REFERENCES public.storage_file(id) ON DELETE CASCADE not valid;

alter table "public"."storage_file_user_access" validate constraint "storage_file_user_access_file_id_fkey";

alter table "public"."storage_folder_user_access" add constraint "storage_folder_user_access_folder_id_fkey" FOREIGN KEY (folder_id) REFERENCES public.storage_folders(id) ON DELETE CASCADE not valid;

alter table "public"."storage_folder_user_access" validate constraint "storage_folder_user_access_folder_id_fkey";

alter table "public"."storage_folders" add constraint "storage_folders_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.storage_folders(id) not valid;

alter table "public"."storage_folders" validate constraint "storage_folders_parent_id_fkey";

alter table "public"."user_groups" add constraint "user_groups_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_groups" validate constraint "user_groups_group_id_fkey";

alter table "public"."users" add constraint "unique_email_company" UNIQUE using index "unique_email_company";

alter table "public"."users" add constraint "users_cv_informations_fkey" FOREIGN KEY (cv_informations) REFERENCES public.cv_informations(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_cv_informations_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.audit_log_func()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    record_id text;
    company_id uuid;
BEGIN
    -- Get company_id from JWT claims
    company_id := (auth.jwt() ->> 'company_id')::uuid;

    -- Dynamically get the primary key value
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        EXECUTE format('SELECT ($1).%I::text', TG_ARGV[0]) INTO record_id USING NEW;
    ELSIF TG_OP = 'DELETE' THEN
        EXECUTE format('SELECT ($1).%I::text', TG_ARGV[0]) INTO record_id USING OLD;
    END IF;

    -- Insert the log entry with company_id
    INSERT INTO audit_logs (
        timestamp, 
        user_id, 
        company_id,  -- New column
        action, 
        table_name, 
        record_id, 
        old_data, 
        new_data
    )
    VALUES (
        CURRENT_TIMESTAMP,
        auth.uid(),
        company_id,
        TG_OP,
        TG_TABLE_NAME,
        record_id,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb END
    );

    -- Return appropriate row
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
    (now() - interval '1 minute' * random() * 60)::timestamp AS executed_at -- Cast to timestamp without time zone
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
 RETURNS TABLE(bucket_name text, size_bytes numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    s.name AS bucket_name,
    COALESCE(SUM((o.metadata->>'size')::bigint), 0) AS size_bytes
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

CREATE OR REPLACE FUNCTION public.get_table_sizes()
 RETURNS TABLE(table_name text, size_bytes bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    c.relname::text AS table_name,
    pg_total_relation_size(c.oid) AS size_bytes
  FROM
    pg_class c
  JOIN
    pg_namespace n ON n.oid = c.relnamespace
  WHERE
    n.nspname = 'public'
    AND c.relkind = 'r'
  ORDER BY
    pg_total_relation_size(c.oid) DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_documents_content(query_embedding extensions.vector, user_id uuid DEFAULT NULL::uuid, match_threshold double precision DEFAULT 0.75, match_count integer DEFAULT 10)
 RETURNS TABLE(id uuid, name character varying, path character varying, owner_id uuid, size integer, type character varying, folder_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, similarity double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (sf.id)
    sf.id,
    sf.name,
    sf.path,
    sf.owner_id,
    sf.size,
    sf.type,
    sf.folder_id,
    sf.created_at,
    sf.updated_at,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM
    public.storage_file_embedding e
  JOIN
    public.storage_file sf ON e.file_id = sf.id
  LEFT JOIN
    public.storage_file_user_access ua ON sf.id = ua.file_id AND ua.user_id = search_documents_content.user_id
  WHERE
    1 - (e.embedding <=> query_embedding) > match_threshold
    AND (
      search_documents_content.user_id IS NULL -- If no user_id provided, return all files
      OR sf.owner_id = search_documents_content.user_id -- User owns the file
      OR ua.file_id IS NOT NULL -- User has explicit access to the file
    )
  ORDER BY
    sf.id, similarity DESC
  LIMIT match_count;
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

grant delete on table "public"."columns" to "anon";

grant insert on table "public"."columns" to "anon";

grant references on table "public"."columns" to "anon";

grant select on table "public"."columns" to "anon";

grant trigger on table "public"."columns" to "anon";

grant truncate on table "public"."columns" to "anon";

grant update on table "public"."columns" to "anon";

grant delete on table "public"."columns" to "authenticated";

grant insert on table "public"."columns" to "authenticated";

grant references on table "public"."columns" to "authenticated";

grant select on table "public"."columns" to "authenticated";

grant trigger on table "public"."columns" to "authenticated";

grant truncate on table "public"."columns" to "authenticated";

grant update on table "public"."columns" to "authenticated";

grant delete on table "public"."columns" to "service_role";

grant insert on table "public"."columns" to "service_role";

grant references on table "public"."columns" to "service_role";

grant select on table "public"."columns" to "service_role";

grant trigger on table "public"."columns" to "service_role";

grant truncate on table "public"."columns" to "service_role";

grant update on table "public"."columns" to "service_role";

grant delete on table "public"."command_center_sessions" to "anon";

grant insert on table "public"."command_center_sessions" to "anon";

grant references on table "public"."command_center_sessions" to "anon";

grant select on table "public"."command_center_sessions" to "anon";

grant trigger on table "public"."command_center_sessions" to "anon";

grant truncate on table "public"."command_center_sessions" to "anon";

grant update on table "public"."command_center_sessions" to "anon";

grant delete on table "public"."command_center_sessions" to "authenticated";

grant insert on table "public"."command_center_sessions" to "authenticated";

grant references on table "public"."command_center_sessions" to "authenticated";

grant select on table "public"."command_center_sessions" to "authenticated";

grant trigger on table "public"."command_center_sessions" to "authenticated";

grant truncate on table "public"."command_center_sessions" to "authenticated";

grant update on table "public"."command_center_sessions" to "authenticated";

grant delete on table "public"."command_center_sessions" to "service_role";

grant insert on table "public"."command_center_sessions" to "service_role";

grant references on table "public"."command_center_sessions" to "service_role";

grant select on table "public"."command_center_sessions" to "service_role";

grant trigger on table "public"."command_center_sessions" to "service_role";

grant truncate on table "public"."command_center_sessions" to "service_role";

grant update on table "public"."command_center_sessions" to "service_role";

grant delete on table "public"."command_center_sessions_messages" to "anon";

grant insert on table "public"."command_center_sessions_messages" to "anon";

grant references on table "public"."command_center_sessions_messages" to "anon";

grant select on table "public"."command_center_sessions_messages" to "anon";

grant trigger on table "public"."command_center_sessions_messages" to "anon";

grant truncate on table "public"."command_center_sessions_messages" to "anon";

grant update on table "public"."command_center_sessions_messages" to "anon";

grant delete on table "public"."command_center_sessions_messages" to "authenticated";

grant insert on table "public"."command_center_sessions_messages" to "authenticated";

grant references on table "public"."command_center_sessions_messages" to "authenticated";

grant select on table "public"."command_center_sessions_messages" to "authenticated";

grant trigger on table "public"."command_center_sessions_messages" to "authenticated";

grant truncate on table "public"."command_center_sessions_messages" to "authenticated";

grant update on table "public"."command_center_sessions_messages" to "authenticated";

grant delete on table "public"."command_center_sessions_messages" to "service_role";

grant insert on table "public"."command_center_sessions_messages" to "service_role";

grant references on table "public"."command_center_sessions_messages" to "service_role";

grant select on table "public"."command_center_sessions_messages" to "service_role";

grant trigger on table "public"."command_center_sessions_messages" to "service_role";

grant truncate on table "public"."command_center_sessions_messages" to "service_role";

grant update on table "public"."command_center_sessions_messages" to "service_role";

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."comments_likes_dislikes" to "anon";

grant insert on table "public"."comments_likes_dislikes" to "anon";

grant references on table "public"."comments_likes_dislikes" to "anon";

grant select on table "public"."comments_likes_dislikes" to "anon";

grant trigger on table "public"."comments_likes_dislikes" to "anon";

grant truncate on table "public"."comments_likes_dislikes" to "anon";

grant update on table "public"."comments_likes_dislikes" to "anon";

grant delete on table "public"."comments_likes_dislikes" to "authenticated";

grant insert on table "public"."comments_likes_dislikes" to "authenticated";

grant references on table "public"."comments_likes_dislikes" to "authenticated";

grant select on table "public"."comments_likes_dislikes" to "authenticated";

grant trigger on table "public"."comments_likes_dislikes" to "authenticated";

grant truncate on table "public"."comments_likes_dislikes" to "authenticated";

grant update on table "public"."comments_likes_dislikes" to "authenticated";

grant delete on table "public"."comments_likes_dislikes" to "service_role";

grant insert on table "public"."comments_likes_dislikes" to "service_role";

grant references on table "public"."comments_likes_dislikes" to "service_role";

grant select on table "public"."comments_likes_dislikes" to "service_role";

grant trigger on table "public"."comments_likes_dislikes" to "service_role";

grant truncate on table "public"."comments_likes_dislikes" to "service_role";

grant update on table "public"."comments_likes_dislikes" to "service_role";

grant delete on table "public"."cv_informations" to "anon";

grant insert on table "public"."cv_informations" to "anon";

grant references on table "public"."cv_informations" to "anon";

grant select on table "public"."cv_informations" to "anon";

grant trigger on table "public"."cv_informations" to "anon";

grant truncate on table "public"."cv_informations" to "anon";

grant update on table "public"."cv_informations" to "anon";

grant delete on table "public"."cv_informations" to "authenticated";

grant insert on table "public"."cv_informations" to "authenticated";

grant references on table "public"."cv_informations" to "authenticated";

grant select on table "public"."cv_informations" to "authenticated";

grant trigger on table "public"."cv_informations" to "authenticated";

grant truncate on table "public"."cv_informations" to "authenticated";

grant update on table "public"."cv_informations" to "authenticated";

grant delete on table "public"."cv_informations" to "service_role";

grant insert on table "public"."cv_informations" to "service_role";

grant references on table "public"."cv_informations" to "service_role";

grant select on table "public"."cv_informations" to "service_role";

grant trigger on table "public"."cv_informations" to "service_role";

grant truncate on table "public"."cv_informations" to "service_role";

grant update on table "public"."cv_informations" to "service_role";

grant delete on table "public"."groups" to "anon";

grant insert on table "public"."groups" to "anon";

grant references on table "public"."groups" to "anon";

grant select on table "public"."groups" to "anon";

grant trigger on table "public"."groups" to "anon";

grant truncate on table "public"."groups" to "anon";

grant update on table "public"."groups" to "anon";

grant delete on table "public"."groups" to "authenticated";

grant insert on table "public"."groups" to "authenticated";

grant references on table "public"."groups" to "authenticated";

grant select on table "public"."groups" to "authenticated";

grant trigger on table "public"."groups" to "authenticated";

grant truncate on table "public"."groups" to "authenticated";

grant update on table "public"."groups" to "authenticated";

grant delete on table "public"."groups" to "service_role";

grant insert on table "public"."groups" to "service_role";

grant references on table "public"."groups" to "service_role";

grant select on table "public"."groups" to "service_role";

grant trigger on table "public"."groups" to "service_role";

grant truncate on table "public"."groups" to "service_role";

grant update on table "public"."groups" to "service_role";

grant delete on table "public"."project_task_history" to "anon";

grant insert on table "public"."project_task_history" to "anon";

grant references on table "public"."project_task_history" to "anon";

grant select on table "public"."project_task_history" to "anon";

grant trigger on table "public"."project_task_history" to "anon";

grant truncate on table "public"."project_task_history" to "anon";

grant update on table "public"."project_task_history" to "anon";

grant delete on table "public"."project_task_history" to "authenticated";

grant insert on table "public"."project_task_history" to "authenticated";

grant references on table "public"."project_task_history" to "authenticated";

grant select on table "public"."project_task_history" to "authenticated";

grant trigger on table "public"."project_task_history" to "authenticated";

grant truncate on table "public"."project_task_history" to "authenticated";

grant update on table "public"."project_task_history" to "authenticated";

grant delete on table "public"."project_task_history" to "service_role";

grant insert on table "public"."project_task_history" to "service_role";

grant references on table "public"."project_task_history" to "service_role";

grant select on table "public"."project_task_history" to "service_role";

grant trigger on table "public"."project_task_history" to "service_role";

grant truncate on table "public"."project_task_history" to "service_role";

grant update on table "public"."project_task_history" to "service_role";

grant delete on table "public"."project_tasks" to "anon";

grant insert on table "public"."project_tasks" to "anon";

grant references on table "public"."project_tasks" to "anon";

grant select on table "public"."project_tasks" to "anon";

grant trigger on table "public"."project_tasks" to "anon";

grant truncate on table "public"."project_tasks" to "anon";

grant update on table "public"."project_tasks" to "anon";

grant delete on table "public"."project_tasks" to "authenticated";

grant insert on table "public"."project_tasks" to "authenticated";

grant references on table "public"."project_tasks" to "authenticated";

grant select on table "public"."project_tasks" to "authenticated";

grant trigger on table "public"."project_tasks" to "authenticated";

grant truncate on table "public"."project_tasks" to "authenticated";

grant update on table "public"."project_tasks" to "authenticated";

grant delete on table "public"."project_tasks" to "service_role";

grant insert on table "public"."project_tasks" to "service_role";

grant references on table "public"."project_tasks" to "service_role";

grant select on table "public"."project_tasks" to "service_role";

grant trigger on table "public"."project_tasks" to "service_role";

grant truncate on table "public"."project_tasks" to "service_role";

grant update on table "public"."project_tasks" to "service_role";

grant delete on table "public"."project_tasks_dependencies" to "anon";

grant insert on table "public"."project_tasks_dependencies" to "anon";

grant references on table "public"."project_tasks_dependencies" to "anon";

grant select on table "public"."project_tasks_dependencies" to "anon";

grant trigger on table "public"."project_tasks_dependencies" to "anon";

grant truncate on table "public"."project_tasks_dependencies" to "anon";

grant update on table "public"."project_tasks_dependencies" to "anon";

grant delete on table "public"."project_tasks_dependencies" to "authenticated";

grant insert on table "public"."project_tasks_dependencies" to "authenticated";

grant references on table "public"."project_tasks_dependencies" to "authenticated";

grant select on table "public"."project_tasks_dependencies" to "authenticated";

grant trigger on table "public"."project_tasks_dependencies" to "authenticated";

grant truncate on table "public"."project_tasks_dependencies" to "authenticated";

grant update on table "public"."project_tasks_dependencies" to "authenticated";

grant delete on table "public"."project_tasks_dependencies" to "service_role";

grant insert on table "public"."project_tasks_dependencies" to "service_role";

grant references on table "public"."project_tasks_dependencies" to "service_role";

grant select on table "public"."project_tasks_dependencies" to "service_role";

grant trigger on table "public"."project_tasks_dependencies" to "service_role";

grant truncate on table "public"."project_tasks_dependencies" to "service_role";

grant update on table "public"."project_tasks_dependencies" to "service_role";

grant delete on table "public"."project_user_tasks" to "anon";

grant insert on table "public"."project_user_tasks" to "anon";

grant references on table "public"."project_user_tasks" to "anon";

grant select on table "public"."project_user_tasks" to "anon";

grant trigger on table "public"."project_user_tasks" to "anon";

grant truncate on table "public"."project_user_tasks" to "anon";

grant update on table "public"."project_user_tasks" to "anon";

grant delete on table "public"."project_user_tasks" to "authenticated";

grant insert on table "public"."project_user_tasks" to "authenticated";

grant references on table "public"."project_user_tasks" to "authenticated";

grant select on table "public"."project_user_tasks" to "authenticated";

grant trigger on table "public"."project_user_tasks" to "authenticated";

grant truncate on table "public"."project_user_tasks" to "authenticated";

grant update on table "public"."project_user_tasks" to "authenticated";

grant delete on table "public"."project_user_tasks" to "service_role";

grant insert on table "public"."project_user_tasks" to "service_role";

grant references on table "public"."project_user_tasks" to "service_role";

grant select on table "public"."project_user_tasks" to "service_role";

grant trigger on table "public"."project_user_tasks" to "service_role";

grant truncate on table "public"."project_user_tasks" to "service_role";

grant update on table "public"."project_user_tasks" to "service_role";

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant references on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant trigger on table "public"."projects" to "anon";

grant truncate on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."storage_file" to "anon";

grant insert on table "public"."storage_file" to "anon";

grant references on table "public"."storage_file" to "anon";

grant select on table "public"."storage_file" to "anon";

grant trigger on table "public"."storage_file" to "anon";

grant truncate on table "public"."storage_file" to "anon";

grant update on table "public"."storage_file" to "anon";

grant delete on table "public"."storage_file" to "authenticated";

grant insert on table "public"."storage_file" to "authenticated";

grant references on table "public"."storage_file" to "authenticated";

grant select on table "public"."storage_file" to "authenticated";

grant trigger on table "public"."storage_file" to "authenticated";

grant truncate on table "public"."storage_file" to "authenticated";

grant update on table "public"."storage_file" to "authenticated";

grant delete on table "public"."storage_file" to "service_role";

grant insert on table "public"."storage_file" to "service_role";

grant references on table "public"."storage_file" to "service_role";

grant select on table "public"."storage_file" to "service_role";

grant trigger on table "public"."storage_file" to "service_role";

grant truncate on table "public"."storage_file" to "service_role";

grant update on table "public"."storage_file" to "service_role";

grant delete on table "public"."storage_file_embedding" to "anon";

grant insert on table "public"."storage_file_embedding" to "anon";

grant references on table "public"."storage_file_embedding" to "anon";

grant select on table "public"."storage_file_embedding" to "anon";

grant trigger on table "public"."storage_file_embedding" to "anon";

grant truncate on table "public"."storage_file_embedding" to "anon";

grant update on table "public"."storage_file_embedding" to "anon";

grant delete on table "public"."storage_file_embedding" to "authenticated";

grant insert on table "public"."storage_file_embedding" to "authenticated";

grant references on table "public"."storage_file_embedding" to "authenticated";

grant select on table "public"."storage_file_embedding" to "authenticated";

grant trigger on table "public"."storage_file_embedding" to "authenticated";

grant truncate on table "public"."storage_file_embedding" to "authenticated";

grant update on table "public"."storage_file_embedding" to "authenticated";

grant delete on table "public"."storage_file_embedding" to "service_role";

grant insert on table "public"."storage_file_embedding" to "service_role";

grant references on table "public"."storage_file_embedding" to "service_role";

grant select on table "public"."storage_file_embedding" to "service_role";

grant trigger on table "public"."storage_file_embedding" to "service_role";

grant truncate on table "public"."storage_file_embedding" to "service_role";

grant update on table "public"."storage_file_embedding" to "service_role";

grant delete on table "public"."storage_file_user_access" to "anon";

grant insert on table "public"."storage_file_user_access" to "anon";

grant references on table "public"."storage_file_user_access" to "anon";

grant select on table "public"."storage_file_user_access" to "anon";

grant trigger on table "public"."storage_file_user_access" to "anon";

grant truncate on table "public"."storage_file_user_access" to "anon";

grant update on table "public"."storage_file_user_access" to "anon";

grant delete on table "public"."storage_file_user_access" to "authenticated";

grant insert on table "public"."storage_file_user_access" to "authenticated";

grant references on table "public"."storage_file_user_access" to "authenticated";

grant select on table "public"."storage_file_user_access" to "authenticated";

grant trigger on table "public"."storage_file_user_access" to "authenticated";

grant truncate on table "public"."storage_file_user_access" to "authenticated";

grant update on table "public"."storage_file_user_access" to "authenticated";

grant delete on table "public"."storage_file_user_access" to "service_role";

grant insert on table "public"."storage_file_user_access" to "service_role";

grant references on table "public"."storage_file_user_access" to "service_role";

grant select on table "public"."storage_file_user_access" to "service_role";

grant trigger on table "public"."storage_file_user_access" to "service_role";

grant truncate on table "public"."storage_file_user_access" to "service_role";

grant update on table "public"."storage_file_user_access" to "service_role";

grant delete on table "public"."storage_folder_user_access" to "anon";

grant insert on table "public"."storage_folder_user_access" to "anon";

grant references on table "public"."storage_folder_user_access" to "anon";

grant select on table "public"."storage_folder_user_access" to "anon";

grant trigger on table "public"."storage_folder_user_access" to "anon";

grant truncate on table "public"."storage_folder_user_access" to "anon";

grant update on table "public"."storage_folder_user_access" to "anon";

grant delete on table "public"."storage_folder_user_access" to "authenticated";

grant insert on table "public"."storage_folder_user_access" to "authenticated";

grant references on table "public"."storage_folder_user_access" to "authenticated";

grant select on table "public"."storage_folder_user_access" to "authenticated";

grant trigger on table "public"."storage_folder_user_access" to "authenticated";

grant truncate on table "public"."storage_folder_user_access" to "authenticated";

grant update on table "public"."storage_folder_user_access" to "authenticated";

grant delete on table "public"."storage_folder_user_access" to "service_role";

grant insert on table "public"."storage_folder_user_access" to "service_role";

grant references on table "public"."storage_folder_user_access" to "service_role";

grant select on table "public"."storage_folder_user_access" to "service_role";

grant trigger on table "public"."storage_folder_user_access" to "service_role";

grant truncate on table "public"."storage_folder_user_access" to "service_role";

grant update on table "public"."storage_folder_user_access" to "service_role";

grant delete on table "public"."storage_folders" to "anon";

grant insert on table "public"."storage_folders" to "anon";

grant references on table "public"."storage_folders" to "anon";

grant select on table "public"."storage_folders" to "anon";

grant trigger on table "public"."storage_folders" to "anon";

grant truncate on table "public"."storage_folders" to "anon";

grant update on table "public"."storage_folders" to "anon";

grant delete on table "public"."storage_folders" to "authenticated";

grant insert on table "public"."storage_folders" to "authenticated";

grant references on table "public"."storage_folders" to "authenticated";

grant select on table "public"."storage_folders" to "authenticated";

grant trigger on table "public"."storage_folders" to "authenticated";

grant truncate on table "public"."storage_folders" to "authenticated";

grant update on table "public"."storage_folders" to "authenticated";

grant delete on table "public"."storage_folders" to "service_role";

grant insert on table "public"."storage_folders" to "service_role";

grant references on table "public"."storage_folders" to "service_role";

grant select on table "public"."storage_folders" to "service_role";

grant trigger on table "public"."storage_folders" to "service_role";

grant truncate on table "public"."storage_folders" to "service_role";

grant update on table "public"."storage_folders" to "service_role";

grant delete on table "public"."user_groups" to "anon";

grant insert on table "public"."user_groups" to "anon";

grant references on table "public"."user_groups" to "anon";

grant select on table "public"."user_groups" to "anon";

grant trigger on table "public"."user_groups" to "anon";

grant truncate on table "public"."user_groups" to "anon";

grant update on table "public"."user_groups" to "anon";

grant delete on table "public"."user_groups" to "authenticated";

grant insert on table "public"."user_groups" to "authenticated";

grant references on table "public"."user_groups" to "authenticated";

grant select on table "public"."user_groups" to "authenticated";

grant trigger on table "public"."user_groups" to "authenticated";

grant truncate on table "public"."user_groups" to "authenticated";

grant update on table "public"."user_groups" to "authenticated";

grant delete on table "public"."user_groups" to "service_role";

grant insert on table "public"."user_groups" to "service_role";

grant references on table "public"."user_groups" to "service_role";

grant select on table "public"."user_groups" to "service_role";

grant trigger on table "public"."user_groups" to "service_role";

grant truncate on table "public"."user_groups" to "service_role";

grant update on table "public"."user_groups" to "service_role";

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

CREATE TRIGGER audit_cv_info AFTER INSERT OR DELETE OR UPDATE ON public.cv_informations FOR EACH ROW EXECUTE FUNCTION public.audit_log_func('id');

CREATE TRIGGER audit_groups AFTER INSERT OR DELETE OR UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.audit_log_func('id');

CREATE TRIGGER audit_projects AFTER INSERT OR DELETE OR UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.audit_log_func('id');

CREATE TRIGGER audit_files AFTER INSERT OR DELETE OR UPDATE ON public.storage_file FOR EACH ROW EXECUTE FUNCTION public.audit_log_func('id');

CREATE TRIGGER audit_folders AFTER INSERT OR DELETE OR UPDATE ON public.storage_folders FOR EACH ROW EXECUTE FUNCTION public.audit_log_func('id');

CREATE TRIGGER audit_users AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.audit_log_func('id');