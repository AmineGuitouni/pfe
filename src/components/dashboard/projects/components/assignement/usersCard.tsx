import { User as UserType } from "@/components/users/types/types";
import { User, Card, CardBody } from "@heroui/react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { useTaskUserAssgnementContext } from "../../context/taskUserAssgnementContext";
import { useMemo } from "react";
import TaskItem from "./showTaskItem";

interface UserCardProps {
    worker: UserType;
    onUnassignTask?: any;
    getTaskById?: any;
    getPriorityColor?: any;
}

export function UserCard({ worker }:UserCardProps) {
    const {taskUserLinks, tasks, userCardDisableDrop} = useTaskUserAssgnementContext()
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
                    </div>
                    <div className="mb-2 flex justify-between">
                        <span className="text-sm text-white/60">
                            Tasks: {workerTasks.length}/{maxTasks}
                        </span>
                        <div className="w-32 h-2 bg-gray-200/20 rounded-full">
                            <div
                            className={`h-2 rounded-full ${
                                workerTasks.length === maxTasks
                                ? 'bg-red-500'
                                : workerTasks.length >= maxTasks * 0.7
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                            }`}
                            style={{ width: `${(workerTasks.length / maxTasks) * 100}%` }}
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