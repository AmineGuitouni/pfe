"use client"
import { cn } from "@heroui/react";
import { useState } from "react";
import { FaRegCircle } from "react-icons/fa6";
import { FaRegCircleCheck } from "react-icons/fa6";
import { Task } from "@/components/dashboard/projects/types";
import { UseColumns } from "../../context/columnsContext";

export default function TaskItem({task,project_id,column_id}:{task : Task,project_id : string,column_id : string}) {

    const [checked, setChecked] = useState(task.task_status === "In Progress");
    const { updateStatus } = UseColumns();

    const handleUpdateStatus = () => {
        if( !project_id || !task) return
        if (task.task_status !== "In Progress" && task.task_status !== "Completed") {
            updateStatus(task.id, "In Progress", project_id, column_id);
        }
        if(task.task_status === "In Progress") {
            updateStatus(task.id, "To Do" , project_id, column_id);
        }
        if(task.task_status === "Completed") {
            setChecked(false)
        }
    }

    return (
        <div className="w-full  p-2 hover:bg-white/20 bg-white/10 group cursor-pointer transition-all ease-linear rounded-lg flex gap-2 ">

            <FaRegCircle onClick={() =>{ 
                setChecked(true)
                handleUpdateStatus()
            }} 
            className={cn("text-light_blue group-hover:text-light_blue-500 mb-[2px] transition-all ease-linear scale-0 mt-[2px] flex-shrink-0 opacity-0 group-hover:scale-100 hover:scale-[110%] group-hover:opacity-100 ",checked ? "hidden" : "block",task.task_status === "Completed" ? "hidden" : "")} size={15}  />

            <FaRegCircleCheck onClick={() => {
                setChecked(false)
                handleUpdateStatus()
            }} className={cn("text-light_blue group-hover:text-light_blue-500 mb-[2px] transition-all mt-[2px] ease-linear opacity-100 flex-shrink-0 hover:scale-[110%]",!checked ? "hidden" : "block",task.task_status === "Completed" ? "hidden" : "")} size={15}  />

            <p className={cn("text-white text-sm  group-hover:text-light_blue-500 transition-all ease-linear -translate-x-5 group-hover:translate-x-0 ",checked ? "translate-x-0" : "",task.task_status === "Completed" ? "line-through -translate-x-0" : "")}>
                {task.title}
            </p>
            
        </div>
    )
}