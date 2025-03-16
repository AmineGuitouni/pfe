export type pageRequirement = {
    authOnly: boolean;
    role?: "owner" | "worker";
    permissions?: string[]
}

export interface pageRuleType {
    path: string;
    requirement: pageRequirement;
    includeSubPages: boolean
} 