export type Group = {
    id: string;
    name: string;
    description: string;
    members_count: number;
    members: string[];
    permissions: string[];
    created_at: string;
}