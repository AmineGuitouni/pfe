"use client"
import TaskItem from "./taskItem";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Column } from "../../types/type";

export default function TaskContainer({column,project_id}:{column : Column,project_id : string}) {
    return (
        <Droppable type="task" droppableId={column.id}>
            {(provided) => (
                <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    className="w-[300px] h-fit flex flex-col bg-white/5 border-white/20 border-1 rounded-md p-3"
                >
                    <p className="text-light_blue text-md font-semibold mb-3">
                        {column.name} 
                        <span className="text-white/50 text-sm ml-2">
                            {column.tasks ? Object.keys(column.tasks).length : 0}
                        </span>
                    </p>
                    <div className="w-full flex flex-col gap-2 mb-1">
                        {column.tasks && column.tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided) => (
                                    <div
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        ref={provided.innerRef}
                                    >
                                        <TaskItem task={task} project_id={project_id} column_id={column.id}/>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                </div>
            )}
        </Droppable>
    )
}
