import { pageRuleType, pageRequirement } from "./types";

export type ApiPathParams = {
    user_id?:string,
    company_id?:string,
    database_id?:string,
    group_id?:string,
    project_id?:string,
    folder_id?:string,
    file_id?:string,
    worker_id?:string,
}
export function extractPathParameters(
    actualPath: string, 
    routePatterns: pageRuleType
): { 
    pattern?: string;
    params?: ApiPathParams;
    rule?: pageRequirement
} {
    // Normalize the path by removing trailing slashes
    const normalizedPath = actualPath.endsWith('/') ? actualPath.slice(0, -1) : actualPath;
    
    // Try to match the path against each pattern
    for (const pattern of Object.keys(routePatterns)) {
        const params: ApiPathParams = {};
        
        // Split both paths into segments
        const patternSegments = pattern.split('/').filter(Boolean);
        const pathSegments = normalizedPath.split('/').filter(Boolean);
        
        // Quick check if the number of segments doesn't match
        if (patternSegments.length !== pathSegments.length) {
            continue;
        }
        
        // Check if each segment matches or is a parameter
        let isMatch = true;
        
        for (let i = 0; i < patternSegments.length; i++) {
            const patternSegment = patternSegments[i];
            const pathSegment = pathSegments[i];
            
            // If it's a parameter (wrapped in [])
            if (patternSegment.startsWith('[') && patternSegment.endsWith(']')) {
                // Extract parameter name without brackets
                const paramName = patternSegment.slice(1, -1) as keyof ApiPathParams;
                
                // TypeScript safety: make sure the parameter is in our ApiPathParams type
                if (
                    paramName === 'user_id' || 
                    paramName === 'company_id' || 
                    paramName === 'database_id' || 
                    paramName === 'group_id' || 
                    paramName === 'project_id' || 
                    paramName === 'folder_id' || 
                    paramName === 'file_id' || 
                    paramName === 'worker_id'
                ) {
                    params[paramName] = pathSegment;
                }
            } 
            // If it's a static segment, must match exactly
            else if (patternSegment !== pathSegment) {
                isMatch = false;
                break;
            }
        }
        
        if (isMatch) {
            return {
                pattern:pattern,
                params:params,
                rule: routePatterns[pattern]
            };
        }
    }
    
    return {};
}