import { assignUsersToTasksResponse } from "@/app/api/v1/[user_id]/companies/[company_id]/projects/[project_id]/tasks/assign/generate/route";
import { User } from "@/components/users/types/types";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

type taskUserLink = Record<string, string[] | undefined>

interface useUsersTaskLinkProps {
    company_id: string;
    project_id: string;
    setUnLinkedTasks: Dispatch<SetStateAction<string[]>>,
    isTaskLoaded: boolean
}

export default function useUsersTaskLink({company_id, project_id, setUnLinkedTasks, isTaskLoaded}: useUsersTaskLinkProps){
    const [usersList, setUsersList] = useState<User[]>([]);
    const [taskUserLinks, setTaskUserLinks] = useState<taskUserLink>({});
    const [loading, setLoading] = useState(true);

    const {data:session} = useSession();

    const getUsersDetails = useCallback(async (ids:string[])=>{
        if(!session?.user.id) {
            return
        }

        try{
            const params = new URLSearchParams({
                ids: JSON.stringify(ids)
            });
            
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/users?${params.toString()}`);

            if(!response.ok){
                return false;
            }

            const {data, error} = await response.json();
            
            if(error){
                return false;
            }

            return data;
        }
        catch(e){
            console.log(e);
            return false;
        }
    },[session?.user.id, company_id])

    const getAiTaskLinks = useCallback(async()=>{
        if(!session?.user.id || !isTaskLoaded) {
            return
        }

        try{
            setLoading(true);
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/projects/${project_id}/tasks/assign/generate`, {method: "GET"})

            if(!response.ok) {
                console.log("responce kalba")
                throw new Error("Failed to get ai task links")
            }

            const responseData: assignUsersToTasksResponse = await response.json();
            const {data} = responseData;

            if(!data){
                console.log("data majatech")
                throw new Error("Failed to get ai task links");
            }

            const taskUserLinks = data.assignments.reduce((acc, assignment) => {
                return {
                    ...acc,
                    [assignment.assignedUsers.userId]: [...(acc[assignment.assignedUsers.userId] || []), assignment.taskId],
                }
            }, {} as taskUserLink);

            const usersIds = taskUserLinks ? Object.keys(taskUserLinks) : [];
            const users = await getUsersDetails(usersIds);
            
            if(!users){
                console.log("users ids 8altin");
                throw new Error("Failed to get ai task links");
            }

            setUsersList(users);
            setTaskUserLinks(taskUserLinks);
            setUnLinkedTasks(prev => prev.filter(taskId => !Object.values(taskUserLinks).flat().includes(taskId)));
        }
        catch(error){
            console.log(error);
            toast.error("Failed to get ai task links");
        }
        finally{
            setLoading(false);
        }
    },[session?.user.id, company_id, project_id, getUsersDetails, setUnLinkedTasks, isTaskLoaded])

    useEffect(()=>{
        getAiTaskLinks()
    },[getAiTaskLinks])

    const addUsers = useCallback((newUsers: User[])=>{
        setUsersList(prev=>(
            [...prev, ...newUsers]
        ));
    },[])

    const removeUsers = useCallback((userId: string[])=>{
        setUsersList(prev=>(
            prev.filter(user=>!userId.includes(user.id))
        ));
    },[])

    const addTaskUserLink = useCallback(
        ({ taskId, userId, index }: { taskId: string; userId: string; index: number }) => {
            setTaskUserLinks((prev) => {
                const userTasks = prev[userId] || [];
                const updatedTasks = [
                    ...userTasks.slice(0, index),
                    taskId,
                    ...userTasks.slice(index),
                ];

                return {
                    ...prev,
                    [userId]: updatedTasks,
                };
            });
        },
        []
    );

    const removeTaskUserLink = useCallback(({taskId, userId}:{taskId: string, userId: string})=>{
        setTaskUserLinks(prev=>({
            ...prev,
            [userId]: prev[userId]?.filter(task=>task !== taskId)
        }));
    },[])

    const romoveAllTaskForUser = useCallback((userId: string)=>{
        setTaskUserLinks(prev=>({
            ...prev,
            [userId]: []
        }));
    },[])

    return ({
        usersList,
        taskUserLinks,
        addUsers,
        removeUsers,
        addTaskUserLink,
        removeTaskUserLink,
        romoveAllTaskForUser,
        setUsersList,
        loading
    })
}