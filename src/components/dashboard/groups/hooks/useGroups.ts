import { useCallback, useEffect, useState } from "react";
import { Group } from "../types/groupsTypes";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { GroupsRouteResponseBody } from "@/app/api/v1/[user_id]/companies/[company_id]/groups/list/route";
import { CreateGroupRequestBody, CreateGroupResponseBody } from "@/app/api/v1/[user_id]/companies/[company_id]/groups/new/route";


export default function useGroups(company_id:string) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();

    const fetchGroups = useCallback(async () => {
        if(!session?.user.id) {
            return
        }

        setLoading(true);
        try{
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/groups/list`);
            if(!response.ok){
                setError("Failed to fetch groups");
                toast.error("Failed to fetch groups");
                return;
            }

            const { data, error } = await response.json() as GroupsRouteResponseBody;

            if(error){
                setError(error);
                toast.error(error);
                return;
            }

            setGroups(data || []);
        }
        catch(e){
            setError(e instanceof Error ? `Groups Error: ${e.message}` : "Something went wrong");
            toast.error(e instanceof Error ? `Groups Error: ${e.message}` : "Something went wrong while fetching groups");
        }
        finally{
            setLoading(false);
        }
    },[session?.user.id, company_id])

    useEffect(() => {
        fetchGroups();
    },[fetchGroups])

    const addGroup = useCallback(async (newGroup: CreateGroupRequestBody) => {
        if(!session?.user.id) {
            return
        }

        try{
            const response = await fetch(`/api/v1/${session?.user.id}/companies/${company_id}/groups/new`, {
                method: "POST",
                body: JSON.stringify({
                    name: newGroup.name,
                    description: newGroup.description,
                    permissions: newGroup.permissions,
                    users: newGroup.users
                })
            })

            if(!response.ok){
                setError("Failed to add group");
                toast.error("Failed to add group");
                return;
            }

            const { data, error } = await response.json() as CreateGroupResponseBody;

            if(error){
                setError(error);
                toast.error(error);
                return;
            }
            if(!data){
                setError("Failed to add group");
                toast.error("Failed to add group");
                return;
            }

            const addedGroup:Group = {
                id: data.id,
                name: newGroup.name,
                description: newGroup.description || "",
                members_count: newGroup.users.length,
                members: newGroup.users,
                permissions: newGroup.permissions,
                created_at: new Date().toISOString()
            }

            setGroups((prevGroups) => [...prevGroups, addedGroup]);
        }
        catch(e){
            setError(e instanceof Error ? `Groups Error: ${e.message}` : "Something went wrong");
            toast.error(e instanceof Error ? `Groups Error: ${e.message}` : "Something went wrong while adding group");
        }
    },[company_id, session?.user.id])

    const getGroupUsersDetails = useCallback(async (ids:string[])=>{
        if(!session?.user.id) {
            return
        }

        try{
            const params = new URLSearchParams({
                ids: JSON.stringify(ids)
            });
            
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/users?${params.toString()}`);

            if(!response.ok){
                setError("Failed to fetch users");
                toast.error("Failed to fetch users");
                return;
            }

            const {data, error} = await response.json();

            if(error){
                setError(error);
                toast.error(error);
                return;
            }

            return data;
        }
        catch(e){
            setError(e instanceof Error ? `Groups Error: ${e.message}` : "Something went wrong");
            toast.error(e instanceof Error ? `Groups Error: ${e.message}` : "Something went wrong while adding group");
        }
    },[session?.user.id, company_id])

    const deleteGroup = useCallback(async (group_id:string) => {
        if(!session?.user.id) {
            return
        }

        try{
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/groups/${group_id}/delete`, {
                method: "DELETE"
            })

            if(!response.ok){
                setError("Failed to delete group");
                toast.error("Failed to delete group");
                return;
            }

            setGroups((prevGroups) => prevGroups.filter((g) => g.id !== group_id));
        }
        catch(e){
            setError(e instanceof Error ? `Groups Error: ${e.message}` : "Something went wrong");
            toast.error(e instanceof Error ? `Groups Error: ${e.message}` : "Something went wrong while deleting group");
        }
    },[company_id, session?.user.id])

    const updateGroup = useCallback(async ({
        id,
        name,
        description,
        permissions,
        users,
    } : {
        id: string,
        name: string,
        description: string,
        permissions: string[],
        users: string[],
    })=>{
        if(!session?.user.id) {
            return
        }

        try{
            const group = groups.find((g) => g.id === id);

            if(!group){
                setError("Group not found");
                toast.error("Group not found");
                return;
            }

            const newUsers = users.filter((u) => !group.members.includes(u));
            const removedUsers = group.members.filter((u) => !users.includes(u));

            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/groups/${id}/edit`, {
                method: "PUT",
                body: JSON.stringify({
                    name,
                    description,
                    permissions,
                    newUsers,
                    removedUsers
                })
            })

            if(!response.ok){
                console.log(response);
                setError("Failed to update group");
                toast.error("Failed to update group");
                return;
            }

            const { data, error } = await response.json() as CreateGroupResponseBody

            if(error){
                setError(error);
                toast.error(error);
                return;
            }

            if(!data){
                setError("Failed to update group");
                toast.error("Failed to update group");
                return;
            }

            const updatedGroup:Group = {
                id: id,
                name: name,
                description: description || "",
                members_count: users.length,
                members: users,
                permissions: permissions,
                created_at: group.created_at
            }

            setGroups((prevGroups) => prevGroups.map((g) => g.id === id ? updatedGroup : g));
        }
        catch(e){
            setError(e instanceof Error ? `Groups Error: ${e.message}` : "Something went wrong");
            toast.error(e instanceof Error ? `Groups Error: ${e.message}` : "Something went wrong while updating group");
        }

    },[company_id, groups, session?.user.id])

    return {groups, loading, error, addGroup, setGroups, getGroupUsersDetails, deleteGroup, updateGroup};
}