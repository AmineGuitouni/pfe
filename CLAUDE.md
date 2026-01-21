# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Megashop**, a Next.js 14 SaaS application for project management and collaboration with AI-powered features. It's designed for Arabic markets with full internationalization support (Arabic, English, French).

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Next.js 14** with App Router and TypeScript
- **NextAuth.js v4** for authentication (credentials provider with bcrypt)
- **Supabase** (PostgreSQL) as the primary database
- **Redis** (via Upstash) for caching
- **LangChain + OpenAI/Cohere** for AI features
- **next-intl** for internationalization
- **HeroUI** (modified NextUI) for UI components
- **Tailwind CSS** for styling

### Directory Structure

```
src/
├── app/
│   ├── [locale]/              # i18n routing (ar, en, fr)
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (home)/           # Public landing pages
│   │   ├── dashboard/
│   │   │   ├── [company]/    # Company-scoped routes
│   │   │   │   ├── projects/    # Project management
│   │   │   │   ├── to-do/       # Kanban task board
│   │   │   │   ├── users/       # User management
│   │   │   │   ├── files/       # File storage
│   │   │   │   ├── groups/      # Permission groups
│   │   │   │   ├── analytics/   # Dashboards & reports
│   │   │   │   ├── audit-logs/  # Activity tracking
│   │   │   │   └── command-center/  # AI chat interface
│   │   │   └── account/     # User account settings
│   │   └── layout.tsx
│   └── api/
│       └── v1/
│           └── [user_id]/    # User-scoped API routes
│               └── companies/[company_id]/  # Company-scoped endpoints
├── components/               # Reusable React components
│   ├── agent/              # AI chat agent components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard feature components
│   └── to-do/              # Kanban board components
└── lib/
    ├── ai/
    │   ├── agent/          # AI agent logic with tool calling
    │   └── prompts/        # System prompts for AI
    ├── auth/               # NextAuth configuration
    ├── database/           # Supabase/Redis clients
    ├── emailtemplets/      # Resend email templates
    └── utils/              # Utility functions
```

### Multi-Tenant Architecture

- **Company isolation**: Each company has isolated data (users, projects, files)
- **Database**: Uses Supabase with JWT-based service accounts for authorization
- **External databases**: Each company can be assigned a separate PostgreSQL database
- **Route structure**: `/dashboard/[company_id]/[feature]` provides company context

### Authentication & Authorization

1. **NextAuth.js** with credentials provider (email/password + company selection)
2. **JWT sessions** containing user data, company_id, and Supabase token
3. **Permission system**: Role-based access with group-based permissions
4. **Permissions defined in** `src/lib/constants.ts`:
   - `groups:*`, `projects:*`, `storage:*`, `users:*` (create/read/update/delete)

### AI Agent System

The AI agent (`src/lib/ai/agent/`) uses function calling to perform actions:

**Tools available to the AI** (defined in `src/lib/ai/agent/tools/toolsDefinitions.ts`):
- `generate_tasks_for_project` - AI generates tasks from project description
- `create_project` - Creates project with tasks and default Kanban columns
- `assign_users_to_project` - Assigns users to tasks
- `list_projects` / `get_project` - Project data retrieval
- `list_users` - User listing with pagination/filtering
- `send_email` - Sends templated emails via Resend
- `generate_task_assignments` - AI-powered task-user matching
- `list_groups` / `create_group` / `edit_group` / `delete_group` - Group management

**Agent flow**: `src/lib/ai/agent/`
1. `prompt.ts` - System prompt with tool definitions
2. `helper/prepareMessages.ts` - Prepares conversation history
3. `helper/agentGeneration.ts` - Calls OpenAI/Cohere
4. `helper/parseToolFromAiRes.ts` - Parses tool calls from AI response
5. `helper/generateAIAudio.ts` - Generates audio responses

### Key Features

- **Projects**: CRUD with AI task generation, dependencies, deadlines
- **Kanban Board**: Drag-and-drop task management (react-dnd/@hello-pangea/dnd)
- **Command Center**: Voice-enabled AI chat interface for managing projects via natural language
- **File Storage**: Folder hierarchy, access control, Supabase storage integration
- **CV Parsing**: Extracts user skills from uploaded PDFs for AI task assignment
- **Analytics**: Recharts-based dashboards with project/user metrics
- **Audit Logs**: Comprehensive activity tracking

### Internationalization

Translation files: `messages/{ar,en,fr}.json`
- Use `useTranslations()` hook in components
- Route prefix: `/{locale}/...`

### Environment Variables

Required (see `.env.production` for reference):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase service role key
- `SUPABASE_JWT_SECRET` - For signing Supabase tokens
- `NEXTAUTH_SECRET` - NextAuth session secret
- `OPENAI_API_KEY` - For AI features
- `COHERE_API_KEY` - Alternative AI provider
- `RESEND_API_KEY` - Email service
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - Redis caching

### Database Schema

Managed via Supabase migrations. Key tables:
- `companies` - Tenant isolation
- `users` - User profiles with company association
- `projects` - Project definitions
- `tasks` - Task items with dependencies
- `columns` - Kanban columns (To Do, In Progress, etc.)
- `groups` - Permission groups
- `user_group_links` - Group memberships
- `files` / `folders` - File storage metadata
- `audit_logs` - Activity tracking

### Utilities

- `src/lib/database/supabase.ts` - `supabase` (anon) and `authedSupabase(userId)` (service role with user context)
- `src/lib/utils/serverFetch.ts` - Server-side fetch helpers for API calls
- `src/lib/database/redis.ts` - Redis client for caching
