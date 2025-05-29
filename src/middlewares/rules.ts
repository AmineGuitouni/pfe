import { pageRuleType } from "./types";

const DatabasesApisRules: pageRuleType = {
    "/api/v1/[user_id]/databases/list":{
        authOnly: true,
        role: "owner",
    },
    "/api/v1/[user_id]/databases/new":{
        authOnly: true,
        role: "owner",
    },
    "/api/v1/[user_id]/databases/[database_id]/delete":{
        authOnly: true,
        role: "owner",
    },
    "/api/v1/[user_id]/databases/[database_id]/edit":{
        authOnly: true,
        role: "owner",
    }
}

const CompaniesApisRules: pageRuleType = {
    "/api/v1/[user_id]/companies/list":{
        authOnly: true,
        role: "owner",
    },
    "/api/v1/[user_id]/companies/new":{
        authOnly: true,
        role: "owner",
    },
    "/api/v1/[user_id]/companies/[company_id]/delete":{
        authOnly: true,
        role: "owner",
    },
    "/api/v1/[user_id]/companies/[company_id]/edit":{
        authOnly: true,
        role: "owner",
    },
    "/api/v1/[user_id]/companies/[company_id]/get":{
        authOnly: true,
        role: "owner",
    }
}

const GroupsApisRules: pageRuleType = {
    "/api/v1/[user_id]/companies/[company_id]/groups/list":{
        authOnly: true,
        role: "worker",
        permissions: ["groups:read"],
    },
    "/api/v1/[user_id]/companies/[company_id]/groups/new":{
        authOnly: true,
        role: "worker",
        permissions: ["groups:create"],
    },
    "/api/v1/[user_id]/companies/[company_id]/groups/[group_id]/delete":{
        authOnly: true,
        role: "worker",
        permissions: ["groups:delete"],
    },
    "/api/v1/[user_id]/companies/[company_id]/groups/[group_id]/edit":{
        authOnly: true,
        role: "worker",
        permissions: ["groups:update"],
    },
    "/api/v1/[user_id]/companies/[company_id]/groups/[group_id]/get":{
        authOnly: true,
        role: "worker",
        permissions: ["groups:read"],
    }
}

const projectsApisRules: pageRuleType = {
    "/api/v1/[user_id]/companies/[company_id]/projects/list":{
        authOnly: true,
        role: "worker",
        permissions: ["projects:read"],
    },
    "/api/v1/[user_id]/companies/[company_id]/projects/new":{
        authOnly: true,
        role: "worker",
        permissions: ["projects:create"],
    },
    "/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/delete":{
        authOnly: true,
        role: "worker",
        permissions: ["projects:delete"],
    },
    // "/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/edit":{
    //     authOnly: true,
    //     role: "worker",
    //     permissions: ["projects:update"],
    // },
    "/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/get":{
        authOnly: true,
        role: "worker",
        permissions: ["projects:read"],
    },
    "/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/tasks/list":{
        authOnly: true,
        role: "worker",
        permissions: ["projects:read"],
    },
    "/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/tasks/assign":{
        authOnly: true,
        role: "worker",
        permissions: ["projects:create", "projects:update", "users:read"],
    },
    "/api/v1/[user_id]/companies/[company_id]/projects/tasks/generate":{
        authOnly: true,
        role: "worker",
        permissions: ["projects:create"],
    }
}

export const apisRules = {
    // ...DatabasesApisRules,
    // ...CompaniesApisRules,
    // ...GroupsApisRules,
    // ...projectsApisRules
}