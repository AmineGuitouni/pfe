import { User } from "@/components/users/types/types";
import { useCallback, useState } from "react";

type taskUserLink = Record<string, string[] | undefined>

export default function useUsersTaskLink(){
    const [usersList, setUsersList] = useState<User[]>([]);
    const [taskUserLinks, setTaskUserLinks] = useState<taskUserLink>({});

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
        setUsersList
    })
}