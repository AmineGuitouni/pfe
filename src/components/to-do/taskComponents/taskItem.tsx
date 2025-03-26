"use client"
import { cn } from "@heroui/react";
import { useState } from "react";
import { FaRegCircle } from "react-icons/fa6";
import { FaRegCircleCheck } from "react-icons/fa6";
import { Draggable } from "react-beautiful-dnd";

export default function TaskItem({index}: {index: number}) {
    const [checked, setChecked] = useState(false);

    return (
        <Draggable index={index} draggableId={`task-${index}`}>
        {(provided ) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="w-full  p-2 hover:bg-white/20 bg-white/10 group cursor-pointer transition-all ease-linear rounded-lg flex gap-2 items-center">

            <FaRegCircle onClick={() => setChecked(true)} className={cn("text-light_blue group-hover:text-light_blue-500 mb-[2px] transition-all ease-linear scale-0 opacity-0 group-hover:scale-100 hover:scale-[110%] group-hover:opacity-100 ",checked ? "hidden" : "block")} size={15}  />

            <FaRegCircleCheck onClick={() => setChecked(false)} className={cn("text-light_blue group-hover:text-light_blue-500 mb-[2px] transition-all ease-linear opacity-100 hover:scale-[110%]",!checked ? "hidden" : "block")} size={15}  />

            <p className={cn("text-white text-medium  group-hover:text-light_blue-500 transition-all ease-linear -translate-x-5 group-hover:translate-x-0 ",checked ? "translate-x-0" : "")}>
                task
            </p>
            
            </div>
        )}
        </Draggable>
    )
}