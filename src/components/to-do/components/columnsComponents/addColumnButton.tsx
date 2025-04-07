"use client"
import { Button } from "@heroui/react";
import { GrChapterAdd } from "react-icons/gr";
import { UseColumns } from "../../context/columnsContext";
import { Column, TaskBoard, statusForCol } from "../../types/type";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function AddColumnButton() {
    const { projects, setProjects } = UseColumns();
    const searchParams = useSearchParams();
    const projectId = searchParams.get("project_id");
    
    const handleAddColumn = () => {
        // Check if we have an active project
        if (!projectId || !projects || !projects[projectId]) {
            toast.error("Please select a project first");
            return;
        }

        setProjects((prevProjects: TaskBoard | undefined) => {
            if (!prevProjects) return prevProjects;
            
            const activeProject = prevProjects[projectId];
            if (!activeProject || !activeProject.columns) return prevProjects;
            
            // Create a new column with a unique ID
            const newColumnId = `column-${Date.now()}`;
            const newColumn: Column = {
                id: newColumnId,
                name: "New Column",
                tasks: {},
                tasksStatus: "To Do" as statusForCol
            };
            
            // Create a new columns object that preserves order:
            // 1. To Do column first
            // 2. All other columns in the middle
            // 3. Done column last
            const newColumns: Record<string, Column> = {};
            
            // Find the todo and done columns
            const todoColumnEntry = Object.entries(activeProject.columns)
                .find(([_, column]) => column.tasksStatus === "To Do");
            
            const doneColumnEntry = Object.entries(activeProject.columns)
                .find(([_, column]) => column.tasksStatus === "Completed");
            
            // Add todo column first if it exists
            if (todoColumnEntry) {
                const [todoId, todoColumn] = todoColumnEntry;
                newColumns[todoId] = todoColumn;
            }
            
            // Add all other columns except todo and done
            Object.entries(activeProject.columns).forEach(([columnId, column]) => {
                if (
                    (!todoColumnEntry || columnId !== todoColumnEntry[0]) && 
                    (!doneColumnEntry || columnId !== doneColumnEntry[0])
                ) {
                    newColumns[columnId] = column;
                }
            });
            
            // Add the new column
            newColumns[newColumnId] = newColumn;
            
            // Add done column last if it exists
            if (doneColumnEntry) {
                const [doneId, doneColumn] = doneColumnEntry;
                newColumns[doneId] = doneColumn;
            }
            
            // Return the updated projects state
            return {
                ...prevProjects,
                [projectId]: {
                    ...activeProject,
                    columns: newColumns
                }
            };
        });
    };

    return (
        <div className="hover:w-14 w-5 h-fit bg-transparent transition-all ease-linear group flex justify-center">
            <Button 
                isIconOnly 
                variant="light" 
                className="scale-0 group-hover:scale-100 text-white transition-all ease-linear mt-4 mx-1" 
                onPress={handleAddColumn}
                disabled={!projectId || !projects}
            > 
                <GrChapterAdd size={20} />
            </Button>
        </div>
    );
}
