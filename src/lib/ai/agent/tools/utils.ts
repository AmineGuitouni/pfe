export function extractToolsFromResponse(response: string) {
    return response.includes(`\`\`\`tool`);
}