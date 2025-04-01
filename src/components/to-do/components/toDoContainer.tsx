"use client"
import ToDoHeader from "./toDoHeader";
import ToDoSidebar from "./sidebar/toDoSidebar";
import Container from "./taskComponents/container";
import { UseColumns } from "../context/columnsContext";
import { useSearchParams } from "next/navigation";

export default function ToDoContainer() {
    const { 
        projects, 
        isLoading, 
        search, 
        setSearch, 
    } = UseColumns();
    
    const params = useSearchParams();
    const projectId = params.get("project_id");
    const activeProject = projects && projectId ? projects[projectId] : undefined;
    

    return (
        <div className="w-full h-full flex">
            <div className="w-full h-full flex flex-col">
                <ToDoHeader project={activeProject || undefined} isLoading={isLoading}/>
                <Container isLoading={isLoading} activeProject={activeProject}/>
            </div>
            <ToDoSidebar 
                projects={projects} 
                isLoading={isLoading} 
                search={search} 
                setSearch={setSearch}
            />
        </div>
    )
}
