import { Project, Task } from "@/components/dashboard/projects/types";

export type toDoProject = {
    projectData : Project,
    columns: { [key: string]: Column },
};

export type statusForCol = "To Do" | "Completed" | "All" | "In Progress" | "Blocked";
export interface Column {
    id: string;
    name: string;
    tasks: Task[];
    tasksStatus : statusForCol;
    order: number;
}

export type TaskBoard = Record<string, toDoProject> 

export type Comment = {
    id : string,
    task_id : string,
    user : {id : string, first_name : string, last_name : string},
    body : string,
    created_at : Date,
    likes : number,
    dislikes : number,
    ownerReact : "like" | "dislike" | null
    reply_to : string | null
}

  
