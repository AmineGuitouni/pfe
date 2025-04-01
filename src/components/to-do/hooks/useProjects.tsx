import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { TaskBoard } from "../types/type";

export default function useProjects({ company_id }: { company_id: string }) {
    
    const [projects, setProjects] = useState<TaskBoard>();
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState(""); 
    const {data:session} = useSession(); 

    const fetchProjects = useCallback( async () => {
        if (!session?.user.id) return
        setIsLoading(true);
        try {
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/to-do/list/get-tasks-projects?search=${search}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const { data } = await response.json();
            setProjects(data);
        } catch {
            toast.error("Error fetching projects");
        } finally {
            setIsLoading(false);
        }
    },[company_id, search, session?.user.id]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    console.log(projects)

    const updateStatus = async (task_id: string, status: string,project_id: string) => {
        if (!session?.user.id) return
        try {
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/to-do/${project_id}/update-task-status`, {
                method: "PUT",
                body: JSON.stringify({ 
                    task_id, status 
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

        } catch {
            toast.error("Error updating status");
        }
    };



    return { projects, isLoading, setSearch,search, updateStatus };
}