import { pageRuleType } from "./types";

export const pages: pageRuleType[] = [
    {
        path: "/dashboard",
        requirement: {
            authOnly: true,
        },
        includeSubPages: true
    }
]