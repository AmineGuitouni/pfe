"use client"
import { cn, useDisclosure } from "@heroui/react";
import { useState } from "react";
import { FaRegCircle } from "react-icons/fa6";
import { FaRegCircleCheck } from "react-icons/fa6";
import { Task } from "@/components/dashboard/projects/types";
import { UseColumns } from "../../context/columnsContext";
import { IoEllipsisVertical } from "react-icons/io5";
import TaskModal from "./taskModal";

export default function TaskItem({task,project_id,allTasks}:{task : Task,project_id : string,allTasks:Task[]}) {

    const [checked, setChecked] = useState(task.checked);
    const {isOpen, onOpen, onOpenChange } = useDisclosure();
    const { checkTask } = UseColumns();
    const [actualTask,setActualTask] = useState<Task>(task)
    const [originalTask] = useState<Task>(task)

    const dependenciesNames = actualTask.dependencies.map((dependencyId) => {
        const dependentTask = allTasks.find((t) => t.id === dependencyId);
        return dependentTask ? dependentTask : null; // Return title or null if not found
    }).filter(name => name !== null); // Filter out any nulls if a dependency task wasn't found

    return (
            <div  className="w-full  p-2 hover:bg-white/20 bg-white/10 group cursor-pointer transition-all ease-linear rounded-lg flex justify-between gap-2 ">

                <div className="flex gap-2">
                    <TaskModal dependncies={dependenciesNames} setTask={setActualTask} task={actualTask}   isOpen={isOpen} onOpenChange={onOpenChange} project_id={project_id} originalTask={originalTask}  />

                    <FaRegCircle onClick={() =>{ 
                        setChecked(true)
                        checkTask(task.id,project_id,true)
                    }} 
                    className={cn("text-light_blue z-10 group-hover:text-light_blue-500 mb-[2px] transition-all ease-linear scale-0 mt-[2px] flex-shrink-0 opacity-0 group-hover:scale-100 hover:scale-[110%] group-hover:opacity-100 ",checked ? "hidden" : "block",task.task_status === "Completed" || task.task_status === "Blocked" ? "hidden" : "")} size={15}  />

                    <FaRegCircleCheck onClick={() => {
                        setChecked(false)
                        checkTask(task.id,project_id,false)
                    }} className={cn("text-light_blue z-10 group-hover:text-light_blue-500 mb-[2px] transition-all mt-[2px] ease-linear opacity-100 flex-shrink-0 hover:scale-[110%]",!checked ? "hidden" : "block",task.task_status === "Completed" || task.task_status === "Blocked" ? "hidden" : "")} size={15}  />

                    <p className={cn("text-white text-sm  group-hover:text-light_blue-500 transition-all ease-linear -translate-x-5 group-hover:translate-x-0 ",checked ? "translate-x-0" : "",task.task_status === "Completed" ? "line-through -translate-x-0" : task.task_status === "Blocked" ? "-translate-x-0 text-red-600" : "")}>
                        {task.title}
                    </p>
                </div>

                <IoEllipsisVertical onClick={onOpen} className="text-white/50 hover:text-white flex-shrink-0 transition-all ease-linear mt-[2px]" />
                
            </div>
    )
}