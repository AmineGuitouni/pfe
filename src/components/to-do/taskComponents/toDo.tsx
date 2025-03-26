"use client"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FaRegCircle } from "react-icons/fa";
import { useState } from "react";
import { FaRegCircleCheck } from "react-icons/fa6";
import { cn } from "@heroui/react";

export default function ToDo() {
    const [checked, setChecked] = useState(false);
    
    return (
        <DragDropContext onDragEnd={()=>{}}>
        <div className="w-[300px] h-fit flex flex-col bg-white/5 border-white/20 border-1 rounded-md p-3">
            <p className="text-light_blue text-md font-semibold mb-3">To Do</p>
            <Droppable droppableId="todo" >
                {(provided) =>(
                    <div ref={provided.innerRef} {...provided.droppableProps} className="w-full flex flex-col gap-2 mb-1">
                    <Draggable index={0} draggableId={`task-${0}`} key={`task-${0}`}>
                            {(provided ) => (
                                <div key={"task-0"} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="w-full  p-2 hover:bg-white/20 bg-white/10 group cursor-pointer transition-all ease-linear rounded-lg flex gap-2 items-center">
                    
                                <FaRegCircle onClick={() => setChecked(true)} className={cn("text-light_blue group-hover:text-light_blue-500 mb-[2px] transition-all ease-linear scale-0 opacity-0 group-hover:scale-100 hover:scale-[110%] group-hover:opacity-100 ",checked ? "hidden" : "block")} size={15}  />
                    
                                <FaRegCircleCheck onClick={() => setChecked(false)} className={cn("text-light_blue group-hover:text-light_blue-500 mb-[2px] transition-all ease-linear opacity-100 hover:scale-[110%]",!checked ? "hidden" : "block")} size={15}  />
                    
                                <p className={cn("text-white text-medium  group-hover:text-light_blue-500 transition-all ease-linear -translate-x-5 group-hover:translate-x-0 ",checked ? "translate-x-0" : "")}>
                                    task
                                </p>
                                
                                </div>
                            )}
                            </Draggable>
                    {provided.placeholder}
                </div>)}
            </Droppable>
        </div>
        </DragDropContext>
    )
}