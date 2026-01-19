"use client"

import { createContext, useCallback, useContext, useState, useEffect, useRef } from "react"
import { Task } from "../types"
import { User } from "@/components/users/types/types"
import { DragDropContext, DragStart, DropResult } from '@hello-pangea/dnd'

const EditAssignmentContext = createContext<EditAssignmentContextType | undefined>(undefined)

export function useEditAssignmentContext() {
    const context = useContext(EditAssignmentContext)
    if (!context) {
        throw new Error("useEditAssignmentContext must be used within an EditAssignmentProvider")
    }
    return context
}

interface EditAssignmentContextType {
    tasks: Record<string, Task>;
    unLinkedTasks: string[];
    taskUserLinks: Record<string, string[]>;
    usersList: User[];
    usersDisableDrop: boolean;
    tasksDisableDrop: boolean;
    userCardDisableDrop: boolean;
    addUsers: (newUsers: User[]) => void;
    removeUser: (userId: string) => void;
    hasChanges: boolean;
    getUpdatedLinks: () => Record<string, string[]>;
}

interface EditAssignmentProviderProps {
    children: React.ReactNode;
    initialTasks: Record<string, Task>;
    initialTaskUserLinks: Record<string, string[]>;
    initialUsers: User[];
    onLinksChange?: (links: Record<string, string[]>) => void;
}

export default function EditAssignmentProvider({
    children,
    initialTasks,
    initialTaskUserLinks,
    initialUsers,
    onLinksChange,
}: EditAssignmentProviderProps) {
    const [tasks, setTasks] = useState<Record<string, Task>>(initialTasks);
    const [taskUserLinks, setTaskUserLinks] = useState<Record<string, string[]>>(initialTaskUserLinks);
    const [usersList, setUsersList] = useState<User[]>(initialUsers);
    const [hasChanges, setHasChanges] = useState(false);

    // Calculate unlinked tasks based on current links
    const [unLinkedTasks, setUnLinkedTasks] = useState<string[]>(() => {
        const linkedTaskIds = new Set(Object.values(initialTaskUserLinks).flat());
        return Object.keys(initialTasks).filter(taskId => !linkedTaskIds.has(taskId));
    });

    const [usersDisableDrop, setUsersDisableDrop] = useState(false);
    const [tasksDisableDrop, setTasksDisableDrop] = useState(false);
    const [userCardDisableDrop, setUserCardDisableDrop] = useState(false);

    // Use ref to track if this is initial render to avoid calling onLinksChange
    const isInitialMount = useRef(true);
    const onLinksChangeRef = useRef(onLinksChange);
    onLinksChangeRef.current = onLinksChange;

    // Update unlinked tasks when initial data changes
    useEffect(() => {
        const linkedTaskIds = new Set(Object.values(initialTaskUserLinks).flat());
        setUnLinkedTasks(Object.keys(initialTasks).filter(taskId => !linkedTaskIds.has(taskId)));
        setTaskUserLinks(initialTaskUserLinks);
        setTasks(initialTasks);
        setUsersList(initialUsers);
        setHasChanges(false);
        isInitialMount.current = true;
    }, [initialTasks, initialTaskUserLinks, initialUsers]);

    // Effect to notify parent of link changes (after state settles)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (hasChanges) {
            onLinksChangeRef.current?.(taskUserLinks);
        }
    }, [taskUserLinks, hasChanges]);

    const onDragEnd = useCallback((props: DropResult) => {
        setUsersDisableDrop(false);
        setTasksDisableDrop(false);
        setUserCardDisableDrop(false);

        if (!props.source || !props.destination) {
            return;
        }

        // Task dropped on user card from tasks list
        if (props.destination.droppableId.startsWith("user:") && props.source.droppableId === "tasks") {
            const userId = props.destination.droppableId.split(":")[1];
            const taskId = props.draggableId;
            
            setTaskUserLinks(prev => {
                const userTasks = prev[userId] || [];
                const newUserTasks = [
                    ...userTasks.slice(0, props.destination!.index),
                    taskId,
                    ...userTasks.slice(props.destination!.index)
                ];
                return { ...prev, [userId]: newUserTasks };
            });
            setUnLinkedTasks(prev => prev.filter(id => id !== taskId));
            setHasChanges(true);
            return;
        }

        // Task dropped from user card back to tasks list
        if (props.source.droppableId.startsWith("user:") && props.destination.droppableId === "tasks") {
            const userId = props.source.droppableId.split(":")[1];
            const taskId = props.draggableId;
            
            setTaskUserLinks(prev => ({
                ...prev,
                [userId]: (prev[userId] || []).filter(id => id !== taskId)
            }));
            setUnLinkedTasks(prev => {
                const items = Array.from(prev);
                items.splice(props.destination!.index, 0, taskId);
                return items;
            });
            setHasChanges(true);
            return;
        }

        // Task moved between user cards
        if (props.source.droppableId.startsWith("user:") && props.destination.droppableId.startsWith("user:")) {
            const sourceUserId = props.source.droppableId.split(":")[1];
            const destUserId = props.destination.droppableId.split(":")[1];
            const taskId = props.draggableId;
            
            // Same user, just reorder
            if (sourceUserId === destUserId) {
                setTaskUserLinks(prev => {
                    const userTasks = [...(prev[sourceUserId] || [])];
                    const taskIndex = userTasks.indexOf(taskId);
                    if (taskIndex !== -1) {
                        userTasks.splice(taskIndex, 1);
                        userTasks.splice(props.destination!.index, 0, taskId);
                    }
                    return { ...prev, [sourceUserId]: userTasks };
                });
            } else {
                // Different users, move between
                setTaskUserLinks(prev => {
                    const newLinks = { ...prev };
                    // Remove from source
                    newLinks[sourceUserId] = (prev[sourceUserId] || []).filter(id => id !== taskId);
                    // Add to destination
                    const destTasks = [...(prev[destUserId] || [])];
                    destTasks.splice(props.destination!.index, 0, taskId);
                    newLinks[destUserId] = destTasks;
                    return newLinks;
                });
            }
            setHasChanges(true);
            return;
        }

        // Reorder users
        if (props.source.droppableId === "users" && props.destination.droppableId === "users") {
            setUsersList(prev => {
                const items = Array.from(prev);
                const [removed] = items.splice(props.source.index, 1);
                items.splice(props.destination!.index, 0, removed);
                return items;
            });
            return;
        }

        // Reorder unlinked tasks
        if (props.source.droppableId === "tasks" && props.destination.droppableId === "tasks") {
            setUnLinkedTasks(prev => {
                const items = Array.from(prev);
                const [removed] = items.splice(props.source.index, 1);
                items.splice(props.destination!.index, 0, removed);
                return items;
            });
            return;
        }
    }, []);

    const onDragStart = useCallback((props: DragStart) => {
        if (props.source.droppableId === "users") {
            setTasksDisableDrop(true);
            setUserCardDisableDrop(true);
        }
        if (props.source.droppableId === "tasks" || props.source.droppableId.startsWith("user:")) {
            setUsersDisableDrop(true);
        }
    }, []);

    const addUsers = useCallback((newUsers: User[]) => {
        setUsersList(prev => {
            const existingIds = new Set(prev.map(u => u.id));
            const uniqueNewUsers = newUsers.filter(u => !existingIds.has(u.id));
            if (uniqueNewUsers.length === 0) return prev;
            return [...prev, ...uniqueNewUsers];
        });
        
        // Initialize empty task arrays for new users and notify parent
        setTaskUserLinks(prev => {
            const newLinks = { ...prev };
            let changed = false;
            newUsers.forEach(user => {
                if (!newLinks[user.id]) {
                    newLinks[user.id] = [];
                    changed = true;
                }
            });
            if (!changed) return prev;
            return newLinks;
        });
        setHasChanges(true);
    }, []);

    const removeUser = useCallback((userId: string) => {
        setTaskUserLinks(prev => {
            // Get user's tasks before removal
            const userTasks = prev[userId] || [];
            
            // Move user's tasks back to unlinked
            if (userTasks.length > 0) {
                setUnLinkedTasks(prevUnlinked => [...prevUnlinked, ...userTasks]);
            }
            
            // Remove user from links
            const newLinks = { ...prev };
            delete newLinks[userId];
            return newLinks;
        });
        
        // Remove user from list
        setUsersList(prev => prev.filter(u => u.id !== userId));
        setHasChanges(true);
    }, []);

    const getUpdatedLinks = useCallback(() => {
        return taskUserLinks;
    }, [taskUserLinks]);

    return (
        <EditAssignmentContext.Provider value={{
            tasks,
            unLinkedTasks,
            taskUserLinks,
            usersList,
            usersDisableDrop,
            tasksDisableDrop,
            userCardDisableDrop,
            addUsers,
            removeUser,
            hasChanges,
            getUpdatedLinks,
        }}>
            <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                {children}
            </DragDropContext>
        </EditAssignmentContext.Provider>
    )
}
