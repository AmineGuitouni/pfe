import { SortDescriptor } from "@heroui/react";
import { Project } from "next/dist/build/swc";
import { useCallback, useEffect, useMemo, useState } from "react";

interface useProjectsProps {
    company_id: string;
    rowPerPage?: number
}

export default function useProjects({
    company_id,
    rowPerPage = 10
}:useProjectsProps) {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(false)
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

    console.log(company_id)

    const fetchProjects = useCallback(async (count: number) => {
        if(count <= 0){
            return
        }
        try {
            const response = await fetch(`/api/v1/projects/list`, {
                method: "GET",
            });
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
    },[]);

    useEffect(()=>{
        fetchProjects(3)
    },[fetchProjects]);

    return {projects, isLoading, error, currentPage, setCurrentPage, totalPages, searchText, setSearchText, sortDescriptor, setSortDescriptor}
}