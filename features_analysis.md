# Website Feature Analysis Summary

This document summarizes the features of the website identified through code analysis.

## Analysis Steps Completed:

1.  **Explore Project Structure:** Listed files in `src` directory (`list_files`).
2.  **Examine Dependencies:** Read `package.json` (`read_file`).
3.  **Review Documentation:** Read `README.md` and `designSheet.md` (`read_file`).
4.  **Analyze Middleware:** Read `src/middleware.ts` (`read_file`).
5.  **Investigate File Management:**
    *   Listed components in `src/components/dashboard/files/` (`list_files`).
    *   Read `src/components/dashboard/files/FilesDashboard.tsx` (`read_file`).
    *   Analyzed `src/components/dashboard/files/hooks/useFiles.ts` (`read_file`).
    *   Analyzed API routes:
        *   `src/app/api/v1/[user_id]/companies/[company_id]/storage/files/list/route.ts` (`read_file`).
        *   `src/app/api/v1/[user_id]/companies/[company_id]/storage/files/new/route.ts` (`read_file`).
6.  **Investigate Project Management:**
    *   Listed components in `src/components/dashboard/projects/` (`list_files`).
    *   Analyzed `src/components/dashboard/projects/hooks/useProjects.ts` (`read_file`).
    *   Listed API routes in `src/app/api/v1/[user_id]/companies/[company_id]/projects/` (`list_files`).
    *   Analyzed API routes:
        *   `src/app/api/v1/[user_id]/companies/[company_id]/projects/list/route.ts` (`read_file`).
        *   `src/app/api/v1/[user_id]/companies/[company_id]/projects/new/route.ts` (`read_file`).
        *   `src/app/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/tasks/list/route.ts` (`read_file`).
7.  **Investigate To-Do Feature:** Searched for API routes related to "todo" (`search_files`), finding none, suggesting a client-side implementation.

## Final Feature Summary:

*   **Core:**
    *   Framework: Next.js 14, React, TypeScript.
    *   Styling: Tailwind CSS.
    *   Internationalization (i18n): Supports English, French, Arabic, German.
*   **Authentication & Authorization:**
    *   Login/Logout (Admin/Worker roles).
    *   User Registration.
    *   Password Reset (via Email).
    *   Email Verification flow.
    *   Protected Routes.
    *   Permission Groups.
    *   Powered by NextAuth, likely using Supabase Auth.
*   **Dashboard Features:**
    *   **Company Management:** CRUD operations.
    *   **Database Management:** CRUD operations, potentially including analytics.
    *   **User Management:** CRUD operations, Role/Group assignments, Filtering.
    *   **File Management:**
        *   CRUD operations for files and folders.
        *   Hierarchical browsing.
        *   Search (including AI-powered semantic search on content).
        *   Download link generation.
        *   Storage via Supabase Storage.
    *   **Project Management:**
        *   CRUD operations for Projects.
        *   Projects created with initial AI-generated tasks.
        *   Kanban-style Task Management (Columns: "To Do", "Done", etc.).
        *   Tasks include descriptions, difficulty levels, and dependencies.
        *   User assignment to tasks.
        *   Project status derived from task completion and deadlines.
    *   **Audit Logs:** Tracking user actions.
    *   **Account Settings:** Profile updates, Password change, Email change.
    *   **Security Configuration:** Dedicated section.
    *   **Personal To-Do List:** Separate feature, likely client-side (using Local Storage).
*   **CV Processing:**
    *   CV Upload/Submission.
    *   AI-powered Parsing (using Langchain, Cohere, OpenAI).
    *   Text Extraction from PDF, DOCX, PPTX.
    *   Middleware enforcement for CV submission.
    *   Automated Email Reminders related to CVs.
*   **Backend & Infrastructure:**
    *   Custom API endpoints built with Next.js API routes.
    *   Supabase: Database (likely multi-tenant), Storage, Auth.
    *   AI Embeddings: Generation (via Cohere/OpenAI/Langchain) and storage for semantic search.
    *   Email Sending: Via Resend service.