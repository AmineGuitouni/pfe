alter table "public"."users" drop constraint "users_pkey";

drop index if exists "public"."users_pkey";

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_user_id_fkey";

alter table "public"."command_center_sessions" add constraint "command_center_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."command_center_sessions" validate constraint "command_center_sessions_user_id_fkey";

alter table "public"."comments" add constraint "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_user_id_fkey";

alter table "public"."comments_likes_dislikes" add constraint "comments_likes_dislikes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."comments_likes_dislikes" validate constraint "comments_likes_dislikes_user_id_fkey";

alter table "public"."cv_informations" add constraint "cv_informations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."cv_informations" validate constraint "cv_informations_user_id_fkey";

alter table "public"."project_user_tasks" add constraint "project_user_tasks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."project_user_tasks" validate constraint "project_user_tasks_user_id_fkey";

alter table "public"."storage_file" add constraint "storage_file_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."storage_file" validate constraint "storage_file_owner_id_fkey";

alter table "public"."storage_file_user_access" add constraint "storage_file_user_access_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."storage_file_user_access" validate constraint "storage_file_user_access_user_id_fkey";

alter table "public"."storage_folder_user_access" add constraint "storage_folder_user_access_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."storage_folder_user_access" validate constraint "storage_folder_user_access_user_id_fkey";

alter table "public"."storage_folders" add constraint "storage_folders_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."storage_folders" validate constraint "storage_folders_owner_id_fkey";

alter table "public"."user_groups" add constraint "user_groups_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_groups" validate constraint "user_groups_user_id_fkey";


