"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { Task } from "../types"
import useTasks from "../hooks/useTasks"
import useUsersTaskLink from "../hooks/useUsersTaskLink"
import { User } from "@/components/users/types/types"
import {DragDropContext, DragStart, DropResult} from 'react-beautiful-dnd'

const TaskUserAssgnementContext = createContext<TaskUserAssgnementContextType | undefined>(undefined)

export function useTaskUserAssgnementContext(){
    const context = useContext(TaskUserAssgnementContext)
    if(!context){
        throw new Error("useTaskUserAssgnementContext must be used within a TaskUserAssgnementContextProvider")
    }

    return context
}

interface TaskUserAssgnementContextType {
    tasks: Record<string, Task>,
    isLoadingTasks: boolean,
    addTaskUserLink: (taskUserLink: { taskId: string, userId: string, index: number }) => void,
    addUsers: (newUsers: User[]) => void,
    removeTaskUserLink: (taskUserLink: { taskId: string, userId: string }) => void,
    removeUsers: (userIds: string[]) => void,
    romoveAllTaskForUser: (userId: string) => void,
    taskUserLinks: Record<string, string[] | undefined>,
    usersList: User[],
    usersDisableDrop: boolean,
    tasksDisableDrop: boolean,
    unLinkedTasks: string[],
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isOpen: boolean,
    userCardDisableDrop: boolean
}

interface TaskUserAssgnementProviderProps {
    children: React.ReactNode,
    company_id: string,
    project_id: string
}

export default function TaskUserAssgnementProvider({children, company_id, project_id}:TaskUserAssgnementProviderProps){
    const {tasks, isLoading: isLoadingTasks, setUnLinkedTasks, unLinkedTasks} = useTasks({company_id, project_id});
    const [isOpen, setIsOpen] = useState(false);
    const {
        addTaskUserLink,
        addUsers,
        removeTaskUserLink,
        removeUsers,
        romoveAllTaskForUser,
        taskUserLinks,
        usersList,
        setUsersList
    } = useUsersTaskLink();

    const [usersDisableDrop, setUsersDisableDrop] = useState(false);
    const [tasksDisableDrop, setTasksDisableDrop] = useState(false);
    const [userCardDisableDrop, setUserCardDisableDrop] = useState(false);

    const onDragEnd = useCallback((props: DropResult)=>{
        setUsersDisableDrop(false);
        setTasksDisableDrop(false);
        setUserCardDisableDrop(false);

        if(!props.source || !props.destination){
            return;
        }

        if(props.destination.droppableId.startsWith("user:") && props.source.droppableId === "tasks"){
            addTaskUserLink({
                taskId: props.draggableId,
                userId: props.destination.droppableId.split(":")[1],
                index: props.destination.index
            })

            setUnLinkedTasks(prev=>prev.filter(taskId=>taskId!==props.draggableId));
        }

        if(props.source.droppableId.startsWith("user:") && props.destination.droppableId === "tasks"){
            removeTaskUserLink({
                taskId: props.draggableId,
                userId: props.source.droppableId.split(":")[1]
            })
            const items = Array.from(unLinkedTasks);
            items.splice(props.destination.index, 0, props.draggableId);
            setUnLinkedTasks(items);
        }

        if(props.source.droppableId === "users" && props.destination.droppableId === "users"){
            const items = Array.from(usersList);
            const [removed] = items.splice(props.source.index, 1);
            items.splice(props.destination.index, 0, removed);
            setUsersList(items);
        }

        if(props.source.droppableId === "tasks" && props.destination.droppableId === "tasks"){
            const items = Array.from(unLinkedTasks);
            const [removed] = items.splice(props.source.index, 1);
            items.splice(props.destination.index, 0, removed);
            setUnLinkedTasks(items);
        }
    },[addTaskUserLink, removeTaskUserLink, usersList, setUsersList, setUnLinkedTasks, unLinkedTasks])

    const onDragStart = useCallback((props: DragStart)=>{
        if(props.source.droppableId === "users"){
            setTasksDisableDrop(true);
            setUserCardDisableDrop(true);
        }
        if(props.source.droppableId === "tasks" || props.source.droppableId.startsWith("user:")){
            setUsersDisableDrop(true);
        }
    },[])

    return(
        <TaskUserAssgnementContext.Provider value={{
            tasks,
            isLoadingTasks,
            addTaskUserLink,
            addUsers,
            removeTaskUserLink,
            removeUsers,
            romoveAllTaskForUser,
            taskUserLinks,
            usersList,
            usersDisableDrop,
            tasksDisableDrop,
            unLinkedTasks,
            setIsOpen,
            isOpen,
            userCardDisableDrop
        }}>
            <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                {children}
            </DragDropContext>
        </TaskUserAssgnementContext.Provider>
    )
}