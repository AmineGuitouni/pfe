export type pageRequirement = {
    authOnly: boolean;
    role?: "owner" | "worker";
    permissions?: string[]
}

// {pagePath: pageRequirement, ... }
export type pageRuleType = Record<string, pageRequirement>