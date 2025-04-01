"use client"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@heroui/react"
import { GoProject } from "react-icons/go";
import { toDoProject } from "../../types/type";
import { useSearchParams } from "next/navigation";
import { Task } from "@/components/dashboard/projects/types";

export default function ProjectItem({project}:{project: toDoProject}) {
    const router = useRouter()
    const pathName = usePathname()
    const params = useSearchParams()

    // Collect all tasks from all columns
    const getAllTasks = () => {
        const allTasks: Task[] = [];
        Object.values(project.columns).forEach(column => {
            if (column.tasks) {
                Object.values(column.tasks).forEach(task => {
                    allTasks.push(task);
                });
            }
        });
        return allTasks;
    };

    const deriveProjectStatus = (tasks: Task[], deadline: string | null) => {
        if (deadline === null) {
            return {status : "Not Started", color:"gray-500"};
        }
    
        if (!tasks || tasks.length === 0) {
            return {status : "Not Started", color:"gray-500"};
        }
    
        const allCompleted = tasks.every(task => task.task_status === "Completed");
        if (allCompleted) {
            return {status:"Completed" ,color:"green-600"};
        }

        return {status:"In Progress", color:"yellow-600"};
    };

    const allTasks = getAllTasks();
    const status: {status: string, color: string} = deriveProjectStatus(allTasks, project.projectData.deadline);
    
    // Count To Do tasks
    const toDoTasksCount = project.columns["todo"]?.tasks ? 
        Object.keys(project.columns["todo"].tasks).length : 0;

    return (
        <div 
        className={cn("w-full flex justify-start py-2 gap-2 pl-5 hover:bg-white/10 group cursor-pointer duration-200 ease-in-out", params.get("project_id") === project.projectData.id ? "bg-white/10" : "")} onClick={() => router.push(pathName + "?project_id=" + project.projectData.id)}>
            <GoProject color={status.color} className={cn("group-hover:text-light_blue-500 mt-[1px] flex-shrink-0",status.color === "green-600" ? "text-green-600" : status.color === "gray-500" ? "text-gray-500" : "text-yellow-600")} size={20} />
            <div className="w-full h-full flex flex-col ">
                <div className="flex gap-2 items-baseline justify-between">
                    <p className="text-white text-medium transition-all ease-linear group-hover:text-light_blue-500">
                            {project.projectData.name.length>15 ? project.projectData.name.substring(0,15) + "..." : project.projectData.name} 
                    </p>
                    <p className="text-white/40 text-sm flex-shrink-0 mr-2">
                        {toDoTasksCount > 0 ? 
                            toDoTasksCount > 1 ? 
                                toDoTasksCount + " tasks " : 
                                toDoTasksCount + " task" : 
                            "No tasks "}
                    </p>
                </div>
                <p className={cn("text-sm group-hover:text-light_blue-500 ",status.color === "green-600" ? "text-green-600" : status.color === "gray-500" ? "text-gray-500" : "text-yellow-600")}>{status.status}</p>
            </div>
        </div>
    )
}
