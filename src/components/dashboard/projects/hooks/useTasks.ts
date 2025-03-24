import { useCallback, useEffect, useState } from "react";
import { Task } from "../types";
import { useSession } from "next-auth/react";

interface UseTasksProps {
    company_id: string,
    project_id: string
}

export default function useTasks({company_id, project_id}: UseTasksProps) {
    const [tasks, setTasks] = useState<Record<string, Task>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [unLinkedTasks, setUnLinkedTasks] = useState<string[]>([]);

    const {data:session} = useSession();

    const fetchTasks = useCallback(async()=>{
        if(!session?.user.id) return
        try {
            setIsLoading(true);
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/projects/${project_id}/tasks/list`);
            const {data}: {data: Task[]} = await response.json();
            
            setTasks(data.reduce((acc, task) => ({...acc, [task.id]: task}), {}));
            setUnLinkedTasks(data.map((task) => task.id));
        }
        catch(e){
            console.log(e)
            setError("Error fetching tasks");
        }
        finally{
            setIsLoading(false);
        }
    },[company_id, project_id, session?.user.id])

    useEffect(()=>{
        fetchTasks();
    },[fetchTasks])

    return {tasks, setTasks, isLoading, setIsLoading, error, setError, setUnLinkedTasks, unLinkedTasks};
}