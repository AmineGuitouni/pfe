/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { GeneratedTask } from "../../../../components/dashboard/projects/types";
import { serverGet, serverPost } from "../../../utils/serverFetch";
import { resend } from "../../../resend";
import { GeneralEmailTemplate } from "../../../emailtemplets";

interface GenerateTasksParams {
    user_id: string;
    company_id: string;
    project_name: string;
    project_description: string;
}

interface CreateProjectParams {
    user_id: string;
    company_id: string;
    project_name: string;
    project_description: string;
    deadline: string | null;
    tasks: GeneratedTask[];
}

interface AssignUsersParams {
    user_id: string;
    company_id: string;
    project_id: string;
    task_user_assignments: Record<string, string[]>;
    deadline: string;
}

interface ListProjectsParams {
    user_id: string;
    company_id: string;
}

interface GetProjectParams {
    user_id: string;
    company_id: string;
    project_id: string;
}

export async function GetProject({user_id, company_id, project_id}: GetProjectParams) {
    try {
        const endpoint = `/api/v1/${user_id}/companies/${company_id}/projects/${project_id}/get`;
        const response = await serverGet(endpoint);

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: null,
                error: errorData.error || `HTTP error! status: ${response.status}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: {
                project: data.projectData,
                tasks: data.tasksData
            },
            error: null
        };
    } catch (error) {
        console.error('Error getting project:', error);
        return {
            success: false,
            message: null,
            error: error instanceof Error ? error.message : "Failed to get project"
        };
    }
}

interface ListUsersParams {
    user_id: string;
    company_id: string;
    page?: number;
    limit?: number;
    search?: string;
    sort?: 'ascending' | 'descending';
    excludedUsers?: string[];
    groups?: string[];
    ids?: string[];
}

interface GenerateTaskAssignmentsParams {
    user_id: string;
    company_id: string;
    project_id: string;
}

interface SendEmailParams {
    user_id: string;
    company_id: string;
    to: string | string[];
    subject: string;
    from?: string;
    // Template data (always used)
    templateData: {
        title: string;
        heading: string;
        content: string;
        buttonText?: string;
        buttonLink?: string;
        companyName?: string;
        footerText?: string;
    };
}

export async function SendEmail({
    to,
    subject,
    from = "noreply@guitouni-studio.online",
    templateData
}: SendEmailParams) {
    try {
        // Validate required parameters
        if (!to || !subject) {
            return {
                success: false,
                message: null,
                error: "Missing required parameters: 'to' and 'subject' are required"
            };
        }

        // Validate template data
        if (!templateData.title || !templateData.heading || !templateData.content) {
            return {
                success: false,
                message: null,
                error: "Missing required templateData (title, heading, content)"
            };
        }

        let emailHtml: string;
        
        // Generate HTML from general template (always used)
        try {
            emailHtml = GeneralEmailTemplate({
                title: templateData.title,
                heading: templateData.heading,
                content: templateData.content,
                buttonText: templateData.buttonText,
                buttonLink: templateData.buttonLink,
                companyName: templateData.companyName,
                footerText: templateData.footerText
            });
        } catch (templateError) {
            console.error('Error generating email template:', templateError);
            return {
                success: false,
                message: null,
                error: `Failed to generate email template: ${templateError instanceof Error ? templateError.message : 'Unknown error'}`
            };
        }

        const emailData = {
            from,
            to,
            subject,
            html: emailHtml
        };

        const { data, error } = await resend.emails.send(emailData);

        if (error) {
            console.error('Error sending email:', error);
            return {
                success: false,
                message: null,
                error: error.message || "Failed to send email"
            };
        }

        return {
            success: true,
            message: {
                email_id: data?.id,
                status: "Email sent successfully",
                to: Array.isArray(to) ? to : [to],
                subject,
                template_used: true
            },
            error: null
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            message: null,
            error: error instanceof Error ? error.message : "Failed to send email"
        };
    }
}

export async function ListUsers({
    user_id,
    company_id,
    page = 1,
    limit = 10,
    search = '',
    sort = 'ascending',
    excludedUsers = [],
    groups = [],
    ids
}: ListUsersParams) {
    try {
        const endpoint = `/api/v1/${user_id}/companies/${company_id}/users/list`;
        const params = new URLSearchParams();
        
        if (ids && ids.length > 0) {
            params.append('ids', JSON.stringify(ids));
        } else {
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (search) params.append('search', search);
            params.append('sort', sort);
            if (excludedUsers.length > 0) params.append('excludedUsers', JSON.stringify(excludedUsers));
            if (groups.length > 0) params.append('groups', JSON.stringify(groups));
        }
        
        const fullEndpoint = `${endpoint}?${params.toString()}`;
        const response = await serverGet(fullEndpoint);

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: null,
                error: errorData.error || `HTTP error! status: ${response.status}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: {
                users: data.data,
                count: data.count || data.data.length
            },
            error: null
        };
    } catch (error) {
        console.error('Error listing users:', error);
        return {
            success: false,
            message: null,
            error: error instanceof Error ? error.message : "Failed to list users"
        };
    }
}

export async function ListProjects({user_id, company_id}: ListProjectsParams) {
    try {
        const endpoint = `/api/v1/${user_id}/companies/${company_id}/projects/list`;
        const response = await serverGet(endpoint);

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: null,
                error: errorData.error || `HTTP error! status: ${response.status}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: {
                projects: data.data
            },
            error: null
        };
    } catch (error) {
        console.error('Error listing projects:', error);
        return {
            success: false,
            message: null,
            error: error instanceof Error ? error.message : "Failed to list projects"
        };
    }
}

export async function GenerateTasksForProject({user_id, company_id, project_name, project_description}: GenerateTasksParams) {
    try {
        const endpoint = `/api/v1/${user_id}/companies/${company_id}/projects/tasks/generate`;
        const body = {
            projectName: project_name,
            projectDescription: project_description
        };
        
        const response = await serverPost(endpoint, body);

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: null,
                error: errorData.error || `HTTP error! status: ${response.status}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: {
                tasks: data.data
            },
            error: null
        };
    } catch (error) {
        console.error('Error generating tasks:', error);
        return {
            success: false,
            message: null,
            error: error instanceof Error ? error.message : "Failed to generate tasks"
        };
    }
}

export async function CreateProject({user_id, company_id, project_name, project_description, tasks}: CreateProjectParams) {
    try {
        const endpoint = `/api/v1/${user_id}/companies/${company_id}/projects/new`;
        const body = {
            project: {
                name: project_name,
                description: project_description
            },
            tasks: tasks
        };
        
        const response = await serverPost(endpoint, body);

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: null,
                error: errorData.error || `HTTP error! status: ${response.status}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: "Project created successfully with tasks and default columns",
            data,
            error: null
        };
    } catch (error) {
        console.error('Error creating project:', error);
        return {
            success: false,
            message: null,
            error: error instanceof Error ? error.message : "Failed to create project"
        };
    }
}

export async function AssignUsersToProject({user_id, company_id, project_id, task_user_assignments, deadline}: AssignUsersParams) {
    try {
        const endpoint = `/api/v1/${user_id}/companies/${company_id}/projects/${project_id}/tasks/assign`;
        const body = {
            taskUserLinks: task_user_assignments,
            deadline: deadline
        };
        
        const response = await serverPost(endpoint, body);

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: null,
                error: errorData.error || `HTTP error! status: ${response.status}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: "Users assigned to project tasks successfully",
            data,
            error: null
        };
    } catch (error) {
        console.error('Error assigning users to project:', error);
        return {
            success: false,
            message: null,
            error: error instanceof Error ? error.message : "Failed to assign users to project"
        };
    }
}

export async function GenerateTaskAssignments({user_id, company_id, project_id}: GenerateTaskAssignmentsParams) {
    try {
        const endpoint = `/api/v1/${user_id}/companies/${company_id}/projects/${project_id}/tasks/assign/generate`;
        const response = await serverGet(endpoint);

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                message: null,
                error: errorData.error || `HTTP error! status: ${response.status}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: {
                assignments: data.data
            },
            error: null
        };
    } catch (error) {
        console.error('Error generating task assignments:', error);
        return {
            success: false,
            message: null,
            error: error instanceof Error ? error.message : "Failed to generate task assignments"
        };
    }
}

export const tools: Record<string, Function | undefined> ={
    "generate_tasks_for_project": GenerateTasksForProject,
    "create_project": CreateProject,
    "assign_users_to_project": AssignUsersToProject,
    "list_projects": ListProjects,
    "get_project": GetProject,
    "list_users": ListUsers,
    "send_email": SendEmail,
    "generate_task_assignments": GenerateTaskAssignments
}