import { Project, Task } from "@/components/dashboard/projects/types";

export type toDoProject = {
    projectData : Project,
    columns: { [key: string]: Column },
};

export type statusForCol = "To Do" | "Completed" | "All" | "In Progress";
export interface Column {
    id: string;
    name: string;
    tasks: Record<string, Task> | undefined
    tasksStatus : statusForCol
}

export type TaskBoard = Record<string, toDoProject> 

  
