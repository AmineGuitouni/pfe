import { GenerateTasksForProject, ListGroups, ListProjects, ListUsers, CreateProject } from "@/lib/ai/agent/tools/toolsDefinitions";

export const ListProjctCommand = ListProjects;
export const ListUsersCommand = ListUsers;
export const ListGroupsCommand = ListGroups;
export const CreateProjectCommand = async ({
    company_id,
    user_id,
    name,
    description
}:{
    company_id: string,
    user_id: string,
    name: string,
    description: string
})=>{
    const tasksGenerationData = await GenerateTasksForProject({
        company_id,
        user_id,
        project_name: name,
        project_description: description
    })

    const prjectCreationData = await CreateProject({
        company_id,
        user_id,
        project_name: name,
        project_description: description,
        deadline: null,
        tasks: tasksGenerationData.message?.tasks,
    })

    return prjectCreationData
};

export const predefinedCommands: Record<string, (...args: any[]) => Promise<any>> = {
    "projects_list": ListProjects,
    "users_list": ListUsers,
    "groups_list": ListGroups,
    "create_project": CreateProjectCommand,
};