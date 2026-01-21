import { ChatCompletionTool } from "openai/resources/index.mjs";

/**
 * OpenAI-compatible tool definitions for the Command Center AI Agent
 * These tools are passed to the OpenAI API for native function calling
 */
export const agentTools: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "generate_tasks_for_project",
            description: "Generates AI-powered tasks for a project based on project name and description. Use this when the user wants to create tasks for a new project.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user requesting the task generation"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company the project belongs to"
                    },
                    project_name: {
                        type: "string",
                        description: "The name of the project"
                    },
                    project_description: {
                        type: "string",
                        description: "A detailed description of the project"
                    }
                },
                required: ["user_id", "company_id", "project_name", "project_description"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_project",
            description: "Creates a complete project with tasks and default columns (To Do, In Progress, Done, Blocked). Use this after generating tasks to create the actual project.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user creating the project"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company the project belongs to"
                    },
                    project_name: {
                        type: "string",
                        description: "The name of the project"
                    },
                    project_description: {
                        type: "string",
                        description: "A detailed description of the project"
                    },
                    deadline: {
                        type: ["string", "null"],
                        description: "The project deadline in ISO date string format, or null if no deadline"
                    },
                    tasks: {
                        type: "array",
                        description: "Array of task objects to create with the project",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                dependencies: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                difficultyLevel: { type: "number" }
                            },
                            required: ["title", "description"]
                        }
                    }
                },
                required: ["user_id", "company_id", "project_name", "project_description", "tasks"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "assign_users_to_project",
            description: "Assigns users to specific tasks within a project and updates project deadline. Use this when users need to be assigned to project tasks.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user making the assignments"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company the project belongs to"
                    },
                    project_id: {
                        type: "string",
                        description: "The ID of the project to assign users to"
                    },
                    task_user_assignments: {
                        type: "object",
                        description: "Object mapping user IDs to arrays of task IDs they should be assigned to",
                        additionalProperties: {
                            type: "array",
                            items: { type: "string" }
                        }
                    },
                    deadline: {
                        type: "string",
                        description: "The updated project deadline (ISO date string)"
                    }
                },
                required: ["user_id", "company_id", "project_id", "task_user_assignments", "deadline"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "list_projects",
            description: "Retrieves a list of all projects for a specific company. Use this when the user wants to see their projects.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user requesting the project list"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company to list projects for"
                    }
                },
                required: ["user_id", "company_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_project",
            description: "Retrieves detailed information about a specific project including all its tasks, dependencies, and assigned users.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user requesting the project details"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company the project belongs to"
                    },
                    project_id: {
                        type: "string",
                        description: "The ID of the specific project to retrieve"
                    }
                },
                required: ["user_id", "company_id", "project_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "list_users",
            description: "Retrieves a list of users for a specific company with filtering and pagination options.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user requesting the user list"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company to list users for"
                    },
                    page: {
                        type: "number",
                        description: "Page number for pagination (default: 1)"
                    },
                    limit: {
                        type: "number",
                        description: "Number of users per page (default: 10)"
                    },
                    search: {
                        type: "string",
                        description: "Search term to filter users by first name, last name, or email"
                    },
                    sort: {
                        type: "string",
                        enum: ["ascending", "descending"],
                        description: "Sort order (default: ascending)"
                    },
                    excludedUsers: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of user IDs to exclude from the results"
                    },
                    groups: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of group names to filter users by group membership"
                    },
                    ids: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of specific user IDs to fetch"
                    }
                },
                required: ["user_id", "company_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "send_email",
            description: "Sends professionally formatted emails using a consistent template design. Use this when the user wants to send emails.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user sending the email"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company the user belongs to"
                    },
                    to: {
                        oneOf: [
                            { type: "string" },
                            { type: "array", items: { type: "string" } }
                        ],
                        description: "Email recipient(s) - single email or array of emails"
                    },
                    subject: {
                        type: "string",
                        description: "Email subject line"
                    },
                    from: {
                        type: "string",
                        description: "Sender email address (optional, defaults to noreply@guitouni-amine.me)"
                    },
                    templateData: {
                        type: "object",
                        description: "Email template data",
                        properties: {
                            title: {
                                type: "string",
                                description: "Email title that appears in browser tab"
                            },
                            heading: {
                                type: "string",
                                description: "Main heading displayed in the email"
                            },
                            content: {
                                type: "string",
                                description: "Main email content - can include HTML formatting"
                            },
                            buttonText: {
                                type: "string",
                                description: "Text for call-to-action button (optional)"
                            },
                            buttonLink: {
                                type: "string",
                                description: "URL for call-to-action button (optional)"
                            },
                            companyName: {
                                type: "string",
                                description: "Company name for branding (optional)"
                            },
                            footerText: {
                                type: "string",
                                description: "Additional text for email footer (optional)"
                            }
                        },
                        required: ["title", "heading", "content"]
                    }
                },
                required: ["user_id", "company_id", "to", "subject", "templateData"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_task_assignments",
            description: "Generates AI-powered task assignments for a project based on user skills, experience, and project requirements.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user requesting the task assignments"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company the project belongs to"
                    },
                    project_id: {
                        type: "string",
                        description: "The ID of the project to generate assignments for"
                    }
                },
                required: ["user_id", "company_id", "project_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "list_groups",
            description: "Retrieves all permission groups for a specific company with complete details including members, permissions, and metadata.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user requesting the groups list"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company to list groups for"
                    }
                },
                required: ["user_id", "company_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_group_ids",
            description: "Retrieves simplified group data (ID and name only) optimized for UI components like dropdowns and selections.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user requesting the group IDs"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company to get group IDs for"
                    }
                },
                required: ["user_id", "company_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_group",
            description: "Creates a new permission group with specified permissions and assigns users to it.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user creating the group"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company the group belongs to"
                    },
                    name: {
                        type: "string",
                        description: "The name of the group"
                    },
                    description: {
                        type: "string",
                        description: "A description of the group's purpose (optional)"
                    },
                    permissions: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of permission strings (e.g., groups:create, projects:read, users:update)"
                    },
                    users: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of user IDs to assign to this group initially"
                    }
                },
                required: ["user_id", "company_id", "name", "permissions", "users"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "edit_group",
            description: "Updates an existing group's details and manages user membership by adding new users and removing existing ones.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user editing the group"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company the group belongs to"
                    },
                    group_id: {
                        type: "string",
                        description: "The ID of the group to edit"
                    },
                    name: {
                        type: "string",
                        description: "Updated group name"
                    },
                    description: {
                        type: "string",
                        description: "Updated group description"
                    },
                    permissions: {
                        type: "array",
                        items: { type: "string" },
                        description: "Updated array of permission strings"
                    },
                    newUsers: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of user IDs to add to the group"
                    },
                    removedUsers: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of user IDs to remove from the group"
                    }
                },
                required: ["user_id", "company_id", "group_id", "name", "description", "permissions", "newUsers", "removedUsers"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "delete_group",
            description: "Permanently deletes a permission group and all associated user relationships. This action is irreversible.",
            parameters: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string",
                        description: "The ID of the user deleting the group"
                    },
                    company_id: {
                        type: "string",
                        description: "The ID of the company the group belongs to"
                    },
                    group_id: {
                        type: "string",
                        description: "The ID of the group to delete"
                    }
                },
                required: ["user_id", "company_id", "group_id"]
            }
        }
    }
];

/**
 * Type definitions for tool calls returned by OpenAI
 */
export interface OpenAIToolCall {
    id: string;
    type: "function";
    function: {
        name: string;
        arguments: string; // JSON string
    };
}

/**
 * Parsed tool call with arguments as object
 */
export interface ParsedToolCall {
    id: string;
    name: string;
    arguments: Record<string, any>;
}

/**
 * Parse tool calls from OpenAI response
 */
export function parseToolCalls(toolCalls: OpenAIToolCall[]): ParsedToolCall[] {
    return toolCalls.map(tc => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments)
    }));
}
