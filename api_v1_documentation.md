# API v1 Documentation

This document outlines the available API routes under `/api/v1`. All routes require authentication, which is handled by middleware.

---

## Databases

### `/api/v1/[user_id]/databases/list`
*   **Method:** `GET`
*   **Description:** Fetches a list of databases associated with the specified user ID.
*   **Path Parameters:**
    *   `user_id`: (string) The unique identifier of the user. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data` (optional): `Database[]` - Array of database objects.
                *   `Database` object properties:
                    *   `id`: (string) The database ID.
                    *   `name`: (string) The database name.
                    *   `created_at`: (string) Timestamp of creation.
                    *   `connection_config`: (object) Supabase connection details.
                        *   `SUPABASE_KEY`: (string)
                        *   `SUPABASE_JWT_SECRET`: (string)
                        *   `NEXT_PUBLIC_SUPABASE_URL`: (string)
                        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (string)
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message.

### `/api/v1/[user_id]/databases/new`
*   **Method:** `POST`
*   **Description:** Creates a new database entry for the specified user.
*   **Path Parameters:**
    *   `user_id`: (string) The unique identifier of the user. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `name`: (string) The name of the database. (Required)
        *   `connection_config`: (object) Supabase connection details. (Required)
            *   `SUPABASE_KEY`: (string) (Required)
            *   `SUPABASE_JWT_SECRET`: (string) (Required)
            *   `NEXT_PUBLIC_SUPABASE_URL`: (string) (Required)
            *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (string) (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `object`
                *   `id`: (string) - The ID of the new database.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) "Missing required fields".
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Missing required fields").
            *   `error`: (string) - Error message ("Internal Server Error").

### `/api/v1/[user_id]/databases/[database_id]/delete`
*   **Method:** `DELETE`
*   **Description:** Deletes a specific database associated with the given user ID and database ID.
*   **Path Parameters:**
    *   `user_id`: (string) The unique identifier of the user. (Required)
    *   `database_id`: (string) The unique identifier of the database to delete. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `message`: (string) - Success message.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message.

### `/api/v1/[user_id]/databases/[database_id]/edit`
*   **Method:** `PUT`
*   **Description:** Updates the name and connection configuration of a specific database.
*   **Path Parameters:**
    *   `user_id`: (string) The unique identifier of the user. (Required)
    *   `database_id`: (string) The unique identifier of the database to edit. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `name`: (string) The new name for the database. (Required)
        *   `connection_config`: (object) The new connection configuration details. (Required)
            *   *(Structure likely: `SUPABASE_KEY`, `SUPABASE_JWT_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)*
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `message`: (string) - Success message.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message.

### `/api/v1/[user_id]/databases/[database_id]/get`
*   **Method:** `GET`
*   **Description:** Fetches the details of a specific database associated with the given user ID and database ID.
*   **Path Parameters:**
    *   `user_id`: (string) The unique identifier of the user. (Required)
    *   `database_id`: (string) The unique identifier of the database to retrieve. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data` (optional): `Database` - Object containing database details.
                *   `id`: (string)
                *   `name`: (string)
                *   `created_at`: (string)
                *   `connection_config`: `object`
                    *   `SUPABASE_KEY`: (string)
                    *   `SUPABASE_JWT_SECRET`: (string)
                    *   `NEXT_PUBLIC_SUPABASE_URL`: (string)
                    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (string)
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message.

---

## Companies

### `/api/v1/[user_id]/companies/list`
*   **Method:** `GET`
*   **Description:** Fetches a list of companies associated with the specified user ID, including database details and worker count.
*   **Path Parameters:**
    *   `user_id`: (string) The unique identifier of the user. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data` (optional): `CompanyType[]` - Array of company objects.
                *   `id`: (string)
                *   `name`: (string)
                *   `created_at`: (string)
                *   `database`: `object | null`
                    *   `id`: (string)
                    *   `name`: (string)
                    *   `created_at`: (string)
                *   `workers`: (number)
    *   Error:
        *   Type: `object`
        *   Properties:
            *   `data`: `[]` - Empty array.
            *   `error`: (string) - Error message.

### `/api/v1/[user_id]/companies/new`
*   **Method:** `POST`
*   **Description:** Creates a new company associated with the specified user ID and links it to a database.
*   **Path Parameters:**
    *   `user_id`: (string) The unique identifier of the user creating the company. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `name`: (string) The name of the new company. (Required)
        *   `database_id`: (string) The ID of the database to associate with the company. (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `object`
                *   `id`: (string) - The ID of the new company.
    *   Error:
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message.
            *   `error`: (string) - Error message.

---

## Company Groups

### `/api/v1/[user_id]/companies/[company_id]/groups/list`
*   **Method:** `GET`
*   **Description:** Fetches a list of permission groups for a specific company.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data` (optional): `Group[]` - Array of group objects.
                *   `id`: (string)
                *   `name`: (string)
                *   `description`: (string)
                *   `permissions`: (any)
                *   `members_count`: (number)
                *   `members`: `string[]`
                *   `created_at`: (string)
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Failed to connect to database" or "Failed to fetch groups").

### `/api/v1/[user_id]/companies/[company_id]/groups/list/get-ids`
*   **Method:** `GET`
*   **Description:** Fetches a list of group IDs and names for a specific company.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `object[]` - Array of objects.
                *   `id`: (string)
                *   `name`: (string)
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Failed to connect to database" or "Failed to fetch groups").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Company ID is required").

### `/api/v1/[user_id]/companies/[company_id]/groups/new`
*   **Method:** `POST`
*   **Description:** Creates a new permission group within a specific company and assigns users.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON) (`CreateGroupRequestBody`)
    *   Properties:
        *   `name`: (string) Group name. (Required)
        *   `description`: (string, optional) Group description.
        *   `permissions`: (string[]) Array of permission strings. (Required)
        *   `users`: (string[]) Array of user IDs to add. (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `object`
                *   `id`: (string) - The ID of the new group.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Company ID is required" or "Name and permissions are required").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Failed to connect to database" or "Failed to create group").

### `/api/v1/[user_id]/companies/[company_id]/groups/[group_id]/delete`
*   **Method:** `DELETE`
*   **Description:** Deletes a specific permission group.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `group_id`: (string) The unique identifier of the group to delete. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `message`: (string) - Success message *(Note: Incorrect message in code)*.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", database error, "Something went wrong").

### `/api/v1/[user_id]/companies/[company_id]/groups/[group_id]/edit`
*   **Method:** `PUT`
*   **Description:** Updates a permission group's details and membership.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `group_id`: (string) The unique identifier of the group to edit. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON) (`EditGroupRequestBody`)
    *   Properties:
        *   `name`: (string) Updated name. (Required)
        *   `description`: (string) Updated description. (Required)
        *   `permissions`: (string[]) Updated permissions array. (Required)
        *   `newUsers`: (string[]) User IDs to add. (Required)
        *   `removedUsers`: (string[]) User IDs to remove. (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `message`: (string) - Success message.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", database error, "Something went wrong").

---

## Company Projects

### `/api/v1/[user_id]/companies/[company_id]/projects/list`
*   **Method:** `GET`
*   **Description:** Fetches a list of projects for a company, including task counts and status.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `object[]` - Array of project objects.
                *   `id`: (string)
                *   `name`: (string)
                *   `description`: (string)
                *   `company_id`: (string)
                *   `deadline`: (string | null)
                *   `created_at`: (string)
                *   `tasks_count`: (number)
                *   `project_status`: (string) - "Not Started", "Completed", or "In Progress".
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to get projects: ...").

### `/api/v1/[user_id]/companies/[company_id]/projects/new`
*   **Method:** `POST`
*   **Description:** Creates a new project, its tasks, default columns, and dependencies.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON) (`ProjectPostRequestBody`)
    *   Properties:
        *   `project`: (object) Project details (name, description, deadline). (Required)
        *   `tasks`: (array) Array of `GeneratedTask` objects (title, description, difficultyLevel, dependencies: string[]). (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `sucess`: (boolean) - Indicates success *(Typo in code)*.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to add project: ...", "Failed to add columns: ...", "Failed to add tasks: ...", "Failed to add dependencies: ...").

### `/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/delete`
*   **Method:** `DELETE`
*   **Description:** Deletes a specific project.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `project_id`: (string) The unique identifier of the project to delete. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: (boolean) - Indicates success.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", database error, "Internal Server Error").

### `/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/get`
*   **Method:** `GET`
*   **Description:** Fetches detailed information about a specific project, including tasks and dependencies.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `project_id`: (string) The unique identifier of the project. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `projectData`: `object`
                *   `id`: (string)
                *   `name`: (string)
                *   `description`: (string)
                *   `deadline`: (string | null)
            *   `tasksData`: `object[]` - Array of task objects.
                *   `id`: (string)
                *   `title`: (string)
                *   `description`: (string)
                *   `task_status`: (string)
                *   `dependencies`: `string[]` - Array of dependent task titles.
                *   `difficultyLevel`: (any)
    *   Error (404):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Project with ID ... not found...").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to get project: ...", "Internal Server Error").

---

## Project Tasks

### `/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/tasks/list`
*   **Method:** `GET`
*   **Description:** Fetches a list of tasks for a specific project. *(Note: Hardcodes task_status to "To Do")*
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `project_id`: (string) The unique identifier of the project. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `Task[]` - Array of task objects.
                *   `id`: (string)
                *   `title`: (string)
                *   `description`: (string)
                *   `difficultyLevel`: (any)
                *   `dependencies`: `string[]` - Array of dependent task IDs.
                *   `task_status`: (string) - Hardcoded to "To Do".
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to get tasks: ...", "Something went wrong").

### `/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/tasks/assign`
*   **Method:** `POST`
*   **Description:** Assigns users to tasks within a project and updates the project deadline.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `project_id`: (string) The unique identifier of the project. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `taskUserLinks`: (object) Record where keys are user IDs (string) and values are arrays of task IDs (string[]). (Required)
        *   `deadline`: (string) The new project deadline. (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: (boolean) - Indicates success.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", database error, "Something went wrong").

### `/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/tasks/assign/generate`
*   **Method:** `GET`
*   **Description:** Generates suggested task assignments using AI based on user CVs and project details.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `project_id`: (string) The unique identifier of the project. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data` (optional): `AssignmentData | null` - AI-generated assignment data (structure defined elsewhere).
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to get users", "Failed to get project info", "Something went wrong").

### `/api/v1/[user_id]/companies/[company_id]/projects/tasks/generate`
*   **Method:** `POST`
*   **Description:** Generates a list of tasks for a project using AI based on project name and description.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) Company ID (in path, not used in logic). (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `projectName`: (string) Project name. (Required)
        *   `projectDescription`: (string) Project description. (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `object[]` - Array of AI-generated task objects (structure depends on AI output).
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (AI error message or "Internal Server Error").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Project name and description are required").

---

## Storage - Files

### `/api/v1/[user_id]/companies/[company_id]/storage/files/list`
*   **Method:** `GET`
*   **Description:** Fetches a list of files, supporting filtering by parent folder and semantic search.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:**
    *   `parent_id`: (string, optional) Parent folder ID (or "null" for root).
    *   `query`: (string, optional) Search string for semantic search.
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data` (optional): `FileItem[]` - Array of file item objects.
                *   `id`: (string)
                *   `created_at`: (string)
                *   `updated_at`: (string)
                *   `name`: (string)
                *   `path`: (string)
                *   `owner_id`: (string | null)
                *   `size`: (number)
                *   `type`: (string)
                *   `folder_id`: (string | null)
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to get query embeddings", "Failed to fetch files with search query: ...", "Failed to fetch files", "Internal Server Error").

### `/api/v1/[user_id]/companies/[company_id]/storage/files/new`
*   **Method:** `POST`
*   **Description:** Uploads a file, saves metadata, and generates embeddings.
*   **Path Parameters:**
    *   `user_id`: (string) User ID uploading the file. (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `FormData`
    *   Properties:
        *   `file`: (File) The file to upload. (Required)
        *   `parentFolderId`: (string, optional) Parent folder ID.
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `object`
                *   `id`: (string) - Database ID of the file record.
                *   `path`: (string) - Path in storage.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("No file provided").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to upload file: ...", "Failed to save file metadata: ...", "Internal Server Error").

### `/api/v1/[user_id]/companies/[company_id]/storage/files/[file_id]/delete`
*   **Method:** `DELETE`
*   **Description:** Deletes a file from storage and its database record.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `file_id`: (string) The unique identifier of the file to delete. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `message`: (string) - Success message.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("File ID is required").
    *   Error (404):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("File not found").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to fetch file details for deletion", "File record is incomplete...", "Failed to delete file from storage: ...", "File deleted from storage, but failed to delete database record...", "Internal Server Error").

### `/api/v1/[user_id]/companies/[company_id]/storage/files/[file_id]/edit`
*   **Method:** `PATCH`
*   **Description:** Updates file metadata (currently only name).
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `file_id`: (string) The unique identifier of the file to edit. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON) (`EditFileRequestBody`)
    *   Properties:
        *   `name`: (string, optional) New file name.
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `message`: (string) - Success message.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("File ID is required", "Invalid request body", "Invalid file name provided", "No valid update data provided", "Invalid JSON format in request body").
    *   Error (404):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("File not found").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Failed to connect to database", "Failed to update file", "Internal Server Error").

### `/api/v1/[user_id]/companies/[company_id]/storage/files/[file_id]/get-link`
*   **Method:** `GET`
*   **Description:** Generates a temporary signed URL for file download.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `file_id`: (string) The unique identifier of the file. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `object`
                *   `signedUrl`: (string) - The temporary download URL.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("File ID is required").
    *   Error (404):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("File not found").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to fetch file details", "File record is incomplete", "Failed to generate download link: ...", "Internal Server Error").

---

## Storage - Folders

### `/api/v1/[user_id]/companies/[company_id]/storage/folders/list`
*   **Method:** `GET`
*   **Description:** Fetches a list of folders, filtered by parent folder ID.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:**
    *   `parent_id`: (string, optional) Parent folder ID (or "null" for root).
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data` (optional): `FolderItem[]` - Array of folder item objects.
                *   `id`: (string)
                *   `name`: (string)
                *   `parent_id`: (string | null)
                *   `created_at`: (string)
                *   `updated_at`: (string)
                *   `owner_id`: (string | null)
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to fetch folders").

### `/api/v1/[user_id]/companies/[company_id]/storage/folders/new`
*   **Method:** `POST`
*   **Description:** Creates a new folder.
*   **Path Parameters:**
    *   `user_id`: (string) User ID creating the folder. (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON) (`CreateFolderRequestBody`)
    *   Properties:
        *   `folderName`: (string) Folder name. (Required)
        *   `folderColor`: (string | null, optional) Folder color.
        *   `parentFolderId`: (string | null, optional) Parent folder ID.
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `object`
                *   `id`: (string) - The ID of the new folder.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to create folder", "Internal Server Error").

### `/api/v1/[user_id]/companies/[company_id]/storage/folders/[folder_id]/delete`
*   **Method:** `DELETE`
*   **Description:** Deletes a folder record (fails if not empty).
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `folder_id`: (string) The unique identifier of the folder to delete. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `message`: (string) - Success message.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Folder ID is required").
    *   Error (409):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Cannot delete folder: It may contain files or subfolders.").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to delete folder", "Internal Server Error").

### `/api/v1/[user_id]/companies/[company_id]/storage/folders/[folder_id]/edit`
*   **Method:** `PATCH`
*   **Description:** Updates folder properties (name and/or color).
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `folder_id`: (string) The unique identifier of the folder to edit. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON) (`EditFolderRequestBody`)
    *   Properties:
        *   `name`: (string, optional) New folder name.
        *   `color`: (string | null, optional) New folder color.
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `message`: (string) - Success message.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Folder ID is required", "Invalid request body", "Invalid JSON format in request body").
    *   Error (404):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Folder not found").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Failed to connect to database", "Failed to update folder", "Internal Server Error").

---

## To-Do Boards

### `/api/v1/[user_id]/companies/[company_id]/to-do/list/get-tasks-projects`
*   **Method:** `GET`
*   **Description:** Fetches To-Do projects and tasks for a user, structured by project and columns. Supports search by project name.
*   **Path Parameters:**
    *   `user_id`: (string) User ID to filter tasks for. (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:**
    *   `search`: (string, optional) Filter projects by name.
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `TaskBoard` - Object keyed by project ID (`string`).
                *   Value: `toDoProject` object
                    *   `projectData`: `object` (id, name, description, deadline, tasks_count, project_status, created_at)
                    *   `columns`: `object` - Keyed by column ID (`string`).
                        *   Value: `Column` object (id, name, tasks: Task[], tasksStatus)
                            *   `Task` properties: (id, difficulty_level, title, description, task_status, column_id, dependencies: string[])
    *   Error:
        *   Type: `object`
        *   Properties:
            *   `data`: `object` - Empty object `{}`.
            *   `error`: (string) - Error message.

### `/api/v1/[user_id]/companies/[company_id]/to-do/new`
*   **Method:** `POST`
*   **Description:** Creates a new column in a To-Do project board.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `name`: (string) Column name. (Required)
        *   `project_id`: (string) Project ID to add column to. (Required)
        *   `task_status`: (string) Task status associated with the column. (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `ok`: (boolean) - Indicates success.
            *   `id`: (string) - ID of the new column.
            *   `created_at`: (string) - Timestamp.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Missing required parameters" or "Missing required data in request body").
            *   `details`: (object) - Contains missing fields.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", database error message).

### `/api/v1/[user_id]/companies/[company_id]/to-do/[project_id]/update-task-status`
*   **Method:** `PUT`
*   **Description:** Updates the status and column of a task.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `project_id`: (string) The unique identifier of the project. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `status`: (string) New task status. (Required)
        *   `task_id`: (string) Task ID to update. (Required)
        *   `column_id`: (string) Column ID the task belongs to. (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `ok`: (boolean) - Indicates success.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Missing required parameters" or "Missing required data in request body").
            *   `details`: (object) - Contains missing fields.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", database error message).

### `/api/v1/[user_id]/companies/[company_id]/to-do/[project_id]/[column_id]/delete`
*   **Method:** `DELETE`
*   **Description:** Deletes a column from a To-Do board.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `project_id`: (string) Project ID (in path, not used in logic). (Required)
    *   `column_id`: (string) The unique identifier of the column to delete. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `ok`: (boolean) - Indicates success.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Missing required parameters").
            *   `details`: (object) - Contains missing fields.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", database error message).

### `/api/v1/[user_id]/companies/[company_id]/to-do/[project_id]/[column_id]/edit`
*   **Method:** `PUT`
*   **Description:** Updates the name of a column.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
    *   `project_id`: (string) Project ID (in path, not used in logic). (Required)
    *   `column_id`: (string) The unique identifier of the column to edit. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `name`: (string) New column name. (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `ok`: (boolean) - Indicates success.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Missing required data in request body").
            *   `details`: (object) - Contains missing fields.
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", database error message).

---

## Company Users

### `/api/v1/[user_id]/companies/[company_id]/users` (GET)
*   **Method:** `GET`
*   **Description:** Fetches users within a company, supporting various filters and pagination.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:**
    *   `ids`: (string, optional) JSON array of user IDs to fetch.
    *   `page`: (number, optional) Page number (default: 1).
    *   `limit`: (number, optional) Users per page (default: 10).
    *   `search`: (string, optional) Search term (name, email).
    *   `sort`: (string, optional) Sort order ("ascending" / "descending", default: "ascending").
    *   `excludedUsers`: (string, optional) JSON array of user IDs to exclude.
*   **Request Body:** None
*   **Response Body:**
    *   If `ids` query parameter is used:
        *   Success (200):
            *   Type: `object`
            *   Properties:
                *   `data`: `object[]` - Array of user objects.
                    *   `id`: (string)
                    *   `first_name`: (string)
                    *   `last_name`: (string)
                    *   `phone_number`: (string)
                    *   `country`: (string)
                    *   `email`: (string)
                    *   `created_at`: (string)
        *   Error:
            *   Type: `object`
            *   Properties:
                *   `data`: `[]` - Empty array.
                *   `error`: (string) - Error message.
    *   If `ids` query parameter is NOT used:
        *   Success (200):
            *   Type: `object`
            *   Properties:
                *   `data`: `object[]` - Array of user objects.
                    *   `id`: (string)
                    *   `first_name`: (string)
                    *   `last_name`: (string)
                    *   `phone_number`: (string)
                    *   `country`: (string)
                    *   `email`: (string)
                    *   `created_at`: (string)
                *   `count`: (number) - Total count of matching users.
        *   Error:
            *   Type: `object`
            *   Properties:
                *   `data`: `[]` - Empty array.
                *   `count`: (number) - 0.
                *   `error`: (string) - Error message.

### `/api/v1/[user_id]/companies/[company_id]/users/[worker_id]/delete` (DELETE)
*   *(Handled by `users/route.ts`)*
*   **Method:** `DELETE`
*   **Description:** Deletes a specific user from a company.
*   **Path Parameters:**
    *   `user_id`: (string) User ID to delete *(Note: Param name mismatch in code)*. (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:** None
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `ok`: (boolean) - Indicates success.
    *   Error:
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., database error).

### `/api/v1/[user_id]/companies/[company_id]/users/[worker_id]/edit` (PUT)
*   *(Handled by `users/route.ts`)*
*   **Method:** `PUT`
*   **Description:** Updates a user's details.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `user`: (object) User object with updated details (id, first_name, last_name, email, country, phone_number). (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `ok`: (boolean) - Indicates success.
            *   `message`: (string) - Success message.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("User data is required").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", database error, "An unexpected error occurred").

### `/api/v1/[user_id]/companies/[company_id]/users/list`
*   **Method:** `GET`
*   **Description:** Enhanced user list fetching, adding group filtering and formatted group output.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:**
    *   `ids`: (string, optional) JSON array of user IDs to fetch.
    *   `page`: (number, optional) Page number (default: 1).
    *   `limit`: (number, optional) Users per page (default: 10).
    *   `search`: (string, optional) Search term (name, email).
    *   `sort`: (string, optional) Sort order ("ascending" / "descending", default: "ascending").
    *   `excludedUsers`: (string, optional) JSON array of user IDs to exclude.
    *   `groups`: (string, optional) JSON array of group names to filter by.
*   **Request Body:** None
*   **Response Body:**
    *   If `ids` query parameter is used:
        *   Success (200):
            *   Type: `object`
            *   Properties:
                *   `data`: `object[]` - Array of user objects.
                    *   `id`: (string)
                    *   `first_name`: (string)
                    *   `last_name`: (string)
                    *   `phone_number`: (string)
                    *   `country`: (string)
                    *   `email`: (string)
                    *   `created_at`: (string)
        *   Error:
            *   Type: `object`
            *   Properties:
                *   `data`: `[]` - Empty array.
                *   `error`: (string) - Error message.
    *   If `ids` query parameter is NOT used:
        *   Success (200):
            *   Type: `object`
            *   Properties:
                *   `data`: `object[]` - Array of formatted user objects.
                    *   `id`: (string)
                    *   `first_name`: (string)
                    *   `last_name`: (string)
                    *   `phone_number`: (string)
                    *   `country`: (string)
                    *   `email`: (string)
                    *   `created_at`: (string)
                    *   `group`: (string) - Comma-separated list of group names.
                *   `count`: (number) - Total count of matching users.
        *   Error:
            *   Type: `object`
            *   Properties:
                *   `data`: `[]` - Empty array.
                *   `count`: (number) - 0.
                *   `error`: (string) - Error message.

### `/api/v1/[user_id]/companies/[company_id]/users/list/get_cv_info`
*   **Method:** `GET`
*   **Description:** Fetches detailed CV information for a specific user.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:**
    *   `id`: (string) User ID whose CV is requested. (Required)
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `data`: `object | null` - Object containing CV details (summary, skills, workExperience, education, languages, certifications, projects, strengths, recommendedTaskTypes) or null.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("User ID is required").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Failed to fetch CV information", "An unexpected error occurred").
            *   `details`: (string, optional) - String representation of the error.

### `/api/v1/[user_id]/companies/[company_id]/users/new`
*   **Method:** `GET` *(Unconventional)*
*   **Description:** Sends an email invitation to a user to join a company.
*   **Path Parameters:**
    *   `user_id`: (string) User ID (in path, not used in logic). (Required)
    *   `company_id`: (string) The unique identifier of the company. (Required)
*   **Query Parameters:**
    *   `email`: (string) Email of the user to invite. (Required)
    *   `groups`: (string[]) Array of group IDs to assign. (Required)
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `ok`: (boolean) - Indicates success.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Email is required", "At least one group is required", "Invalid email format", "Company ID is required").
    *   Error (404):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Company not found").
    *   Error (409):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("User already exists").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Failed to connect to database", "Database query error", "Server configuration error", "Unable to send email, try again later", "Internal Server Error").

---

## User Preferences

### `/api/v1/preferences/profileInfo`
*   **Method:** `PUT`
*   **Description:** Updates the current user's profile information.
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `id`: (string) User ID to update. (Required)
        *   `first_name`: (string) Updated first name. (Required)
        *   `last_name`: (string) Updated last name. (Required)
        *   `country`: (string) Updated country. (Required)
        *   `phone_number`: (string) Updated phone number. (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object` - Contains the updated user record.
        *   Properties:
            *   `id`: (string)
            *   `first_name`: (string)
            *   `last_name`: (string)
            *   `country`: (string)
            *   `phone_number`: (string)
            *   *(Other user fields might be included depending on the `select()`)*
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("User ID is required" or "First and last name are required").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., database error message, "Internal server error").

### `/api/v1/preferences/reset_email`
*   **Method:** `POST`
*   **Description:** Updates user's email using a verification token. *(Note: Success message is incorrect)*
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `email`: (string) New email address. (Required)
        *   `token`: (string) JWT verification token. (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `success`: (boolean) - Indicates success.
            *   `message`: (string) - Success message *(Note: Incorrect message in code)*.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Missing required fields").
    *   Error (401):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Invalid or expired token").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., database update error message, internal server error message).

### `/api/v1/preferences/change_password/sendMail`
*   **Method:** `GET` *(Unconventional)*
*   **Description:** Sends a password change email with a verification token. Returns success even if email not found.
*   **Path Parameters:** None
*   **Query Parameters:**
    *   `email`: (string) User's email address. (Required)
*   **Request Body:** None
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `ok`: (boolean) - Indicates the process completed.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Email is required").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., "Unable to send email, try again later", "Internal Server Error").

### `/api/v1/preferences/change_password/change-password`
*   **Method:** `POST`
*   **Description:** Changes the user's password after verifying old password and token.
*   **Path Parameters:** None
*   **Query Parameters:** None
*   **Request Body:**
    *   Type: `object` (JSON)
    *   Properties:
        *   `password`: (string) New password. (Required)
        *   `token`: (string) JWT verification token. (Required)
        *   `oldPassword`: (string) Current password. (Required)
*   **Response Body:**
    *   Success (200):
        *   Type: `object`
        *   Properties:
            *   `success`: (boolean) - Indicates success.
            *   `message`: (string) - Success message.
    *   Error (400):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Missing required fields").
    *   Error (401):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("Invalid old password" or "Invalid or expired token").
    *   Error (404):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message ("User not found").
    *   Error (500):
        *   Type: `object`
        *   Properties:
            *   `error`: (string) - Error message (e.g., database update error message, "An unexpected error occurred.").