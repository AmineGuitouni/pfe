import { SortDescriptor } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Project } from "../types";
import { useSession } from "next-auth/react";

interface useProjectsProps {
    company_id: string;
    rowPerPage?: number
}

export default function useProjects({
    company_id,
    rowPerPage = 10
}:useProjectsProps) {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")


    const [currentPage, setCurrentPage] = useState(1)
    const [searchText, setSearchText] = useState("")
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    })
    
    const totalPages = useMemo(()=>{
        return Math.ceil(projects.length / rowPerPage)
    }, [projects, rowPerPage])

    const {data:session} = useSession();

    const fetchProjects = useCallback(async (count: number) => {
        if(!session?.user.id) return
        if(count <= 0){
            return
        }
        try {
            setIsLoading(true);
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/projects/list`, {
                method: "GET",
            });

            if(!response.ok){
                setError("Something went wrong");
                return;
            }

            const result = await response.json();
            if (result.error) {
                setError(result.error);
            } else {
                setProjects(result.data);
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    },[session?.user.id, company_id]);

    useEffect(()=>{
        fetchProjects(3)
    },[fetchProjects]);

    return {projects, isLoading, error, currentPage, setCurrentPage, totalPages, searchText, setSearchText, sortDescriptor, setSortDescriptor}
}