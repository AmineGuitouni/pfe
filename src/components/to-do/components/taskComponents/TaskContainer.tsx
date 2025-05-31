"use client"
import TaskItem from "./taskItem";
import { Draggable, Droppable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Column } from "../../types/type";
import { UseColumns } from "../../context/columnsContext";
import { useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@heroui/react";
import ColoneSettings from "../columnsComponents/coloneSettings";
import { useSession } from "next-auth/react";

interface TaskContainerProps {
    column: Column;
    project_id: string;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
    isDragging?: boolean;
}

export default function TaskContainer({ column, project_id, dragHandleProps, isDragging }: TaskContainerProps) {
    const { deleteColumn } = UseColumns();
    const [isDeleted, setIsDeleted] = useState(false);
    const {data : session } = useSession()

    const myTasks = column.tasks.filter((task)=> task.user_id === session?.user.id)

    const handleDelete = async () => {
        try {
            setIsDeleted(true);
            await deleteColumn(column.id, project_id);
        } catch {
            toast.error("Error deleting column");
        } finally {
            setIsDeleted(false);
        }
    };

    const getColorByStatus = (status: string) => {
        switch (status) {
            case "Blocked":
                return "text-red-600";
            case "In Progress":
                return "text-yellow-600";
            case "Completed":
                return "text-green-600";
            case "All":
                return "text-gray-500";
            default:
                return "text-light_blue-500";
        }
    };

    return (
        <Droppable type="task" droppableId={column.id}>
            {(provided) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                        "w-[300px] h-fit flex flex-col bg-white/5 border-white/20 border-1 rounded-md p-3 transition-all ease-linear",
                        isDeleted && "animate-pulse",
                        isDragging && "transform rotate-2 shadow-lg opacity-80"
                    )}
                >
                    <div
                        className="w-full flex justify-between cursor-grab active:cursor-grabbing hover:bg-white/10 rounded-md p-1 -m-1 transition-colors"
                        {...dragHandleProps}
                    >
                        <div className="flex flex-grow items-baseline mb-3 ">
                            <p className="text-light_blue text-md font-semibold  line-clamp-1">
                                {column.name}
                            </p>
                            <p className="text-white/50 text-xs font-normal ml-2">
                                {myTasks.length > 0
                                    ? myTasks.length === 1
                                        ? "1 Task"
                                        : myTasks.length + " Tasks"
                                    : "No tasks"}
                            </p>
                        </div>
                        <ColoneSettings deleteColumn={handleDelete} column_id={column.id}/>
                            
                    </div>
                    <div className={"w-full flex flex-col gap-2  transition-all ease-linear min-w-2"}>
                        {column.tasks &&
                            myTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided) => (
                                        <div
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            ref={provided.innerRef}
                                        >
                                            <TaskItem
                                                task={task}
                                                project_id={project_id}
                                                allTasks={column.tasks}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                        {provided.placeholder}
                    </div>
                    <p className="text-white/50 text-xs font-normal mt-[15px]">Task status : <span className={getColorByStatus(column.tasksStatus)}>{column.tasksStatus}</span></p>
                </div>
            )}
        </Droppable>
    );
}