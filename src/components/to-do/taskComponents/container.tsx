"use client"
import { DragDropContext } from "react-beautiful-dnd";
import Done from "./done";
import ToDo from "./toDo";

export default function TaskContainer() {
    return (
            <div className="w-full h-full flex  gap-8 p-5 ">
                <ToDo/>
                <Done/>
            </div>  
    )
}