import { User as UserType } from "@/components/users/types/types";
import { User, Card, CardBody, Skeleton } from "@heroui/react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { useTaskUserAssgnementContext } from "../../context/taskUserAssgnementContext";
import { useMemo } from "react";
import TaskItem from "./showTaskItem";
import TaskItemSkeleton from "../tasks/TaskItemSkeleton";
import { IoMdCloseCircle } from "react-icons/io";

interface UserCardProps {
    worker: UserType;
    onUnassignTask?: any;
    getTaskById?: any;
    getPriorityColor?: any;
}

export function UserCard({ worker }:UserCardProps) {
    const {taskUserLinks, tasks, userCardDisableDrop, removeUsers} = useTaskUserAssgnementContext()
    const workerTasks = useMemo(()=>{
        const tasksids = taskUserLinks[worker.id] || []

        return tasksids.map(task => ({
            ...tasks[task], 
            dependencies: tasks[task].dependencies.map(d=>tasks[d].title)
        }))
    },[taskUserLinks, tasks, worker.id])
  
    const maxTasks = 10

    return (
        <Card
            className={
                "bg-white/5 rounded-lg transition-colors duration-200 group border border-white/20"
            }
        >
            <CardBody className="p-6 flex flex-col justify-between overflow-hidden">
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <User
                            name={worker.first_name + " " + worker.last_name}
                            description={worker.email}
                            avatarProps={{
                                name: worker.first_name,
                                isBordered: true,
                            }}
                            classNames={{
                              name: "text-white line-clamp-1",
                              description: "text-white/80"
                            }}
                        />
                        <IoMdCloseCircle 
                            className="text-light_blue-500 hover:text-left_blue cursor-pointer" 
                            size={20}
                            onClick={()=>{
                                removeUsers([worker.id])
                            }}
                        />
                    </div>
                    <div className="mb-2 flex justify-between">
                        <span className="text-sm text-white/60">
                            Tasks: {Math.min(workerTasks.length, maxTasks)}/{maxTasks}
                        </span>
                        <div className="w-32 h-2 bg-gray-200/20 rounded-full">
                            <div
                            className={`h-2 rounded-full ${
                                Math.min(workerTasks.length, maxTasks) === maxTasks
                                ? 'bg-red-500'
                                : Math.min(workerTasks.length, maxTasks) >= maxTasks * 0.7
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                            }`}
                            style={{ width: `${(Math.min(workerTasks.length, maxTasks) / maxTasks) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-100/50 pt-3 space-y-2">
                    {
                        workerTasks.length === 0 && (
                            <div className="py-4 text-center bg-gray-50/20 border border-dashed border-gray-200/50 rounded text-light_blue-500">
                                Drop tasks here
                            </div>
                        )
                    }
                    <Droppable droppableId={`user:${worker.id}`} isDropDisabled={userCardDisableDrop}>
                        {
                            (provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                    {
                                        workerTasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided) => (
                                                    <div className="mb-4" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                        <TaskItem key={task.id} task={task} isHighlighted={false}/>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))
                                    }
                                    {provided.placeholder}
                                </div>
                            )
                        }
                    </Droppable>
                </div>
            </CardBody>
        </Card>
    );
}

export function UserCardSkeleton() {
    return (
        <Card className="bg-white/5 rounded-lg border border-white/20">
            <CardBody className="p-6 flex flex-col justify-between overflow-hidden">
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="rounded-full bg-gray-700 w-12 h-12" />
                            <div className="flex flex-col gap-1">
                                <Skeleton className="h-4 bg-gray-700 w-32 rounded" />
                                <Skeleton className="h-3 bg-gray-700 w-24 rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="mb-2 flex justify-between">
                        <Skeleton className="h-3 bg-gray-700 w-20 rounded" />
                        <Skeleton className="w-32 bg-gray-700 h-2 rounded-full" />
                    </div>
                </div>
                <div className="border-t border-gray-100/50 pt-3 mt-4 space-y-2">
                    {/* Placeholder for tasks */}
                    <div className="space-y-2 flex flex-col gap-4">
                        {[...Array(2).map((_, i) => (
                            <TaskItemSkeleton index={i} key={i}/>
                        ))]}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}