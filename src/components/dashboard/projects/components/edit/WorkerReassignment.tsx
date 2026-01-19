"use client"

import { Button, Input, Avatar } from "@heroui/react";
import { IoSearchOutline } from "react-icons/io5";
import { FiPlus, FiTrash2, FiUser } from "react-icons/fi";
import { useState, useMemo, useCallback } from "react";
import { Task } from "../../types";
import { User } from "@/components/users/types/types";
import EditAssignmentProvider, { useEditAssignmentContext } from "../../context/editAssignmentContext";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import AddUserToProjectModal from "../modals/AddUserToProjectModal";

interface WorkerReassignmentProps {
    company_id: string;
    tasks: Record<string, Task>;
    initialTaskUserLinks: Record<string, string[]>;
    initialUsers: User[];
    onLinksChange: (links: Record<string, string[]>) => void;
    onAddUser: (user: User) => void;
    onRemoveUser: (userId: string) => void;
}

export default function WorkerReassignment({
    company_id,
    tasks,
    initialTaskUserLinks,
    initialUsers,
    onLinksChange,
    onAddUser,
    onRemoveUser,
}: WorkerReassignmentProps) {
    return (
        <EditAssignmentProvider
            initialTasks={tasks}
            initialTaskUserLinks={initialTaskUserLinks}
            initialUsers={initialUsers}
            onLinksChange={onLinksChange}
        >
            <WorkerReassignmentContent
                company_id={company_id}
                onAddUserExternal={onAddUser}
                onRemoveUserExternal={onRemoveUser}
            />
        </EditAssignmentProvider>
    );
}

function WorkerReassignmentContent({
    company_id,
    onAddUserExternal,
    onRemoveUserExternal,
}: {
    company_id: string;
    onAddUserExternal: (user: User) => void;
    onRemoveUserExternal: (userId: string) => void;
}) {
    const {
        tasks,
        unLinkedTasks,
        taskUserLinks,
        usersList,
        usersDisableDrop,
        tasksDisableDrop,
        userCardDisableDrop,
        addUsers,
        removeUser,
    } = useEditAssignmentContext();

    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [taskSearchTerm, setTaskSearchTerm] = useState('');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);

    const filteredUsers = useMemo(() => {
        return usersList.filter(user =>
            user.first_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.last_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
        );
    }, [usersList, userSearchTerm]);

    const filteredUnlinkedTasks = useMemo(() => {
        return unLinkedTasks
            .map(taskId => tasks[taskId])
            .filter(task => task && task.title.toLowerCase().includes(taskSearchTerm.toLowerCase()));
    }, [unLinkedTasks, tasks, taskSearchTerm]);

    const handleAddUsers = useCallback((newUsers: User[]) => {
        addUsers(newUsers);
        newUsers.forEach(user => onAddUserExternal(user));
    }, [addUsers, onAddUserExternal]);

    const handleRemoveUser = useCallback((userId: string) => {
        removeUser(userId);
        onRemoveUserExternal(userId);
    }, [removeUser, onRemoveUserExternal]);

    return (
        <div className="w-full h-full flex gap-6">
            {/* Left Panel - Workers */}
            <div className="w-[400px] flex flex-col gap-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        className="dark bg-light_blue-500/10 hover:bg-light_blue-500/20"
                        startContent={<FiPlus size={16} />}
                        onPress={() => setIsAddUserOpen(true)}
                    >
                        Add Worker
                    </Button>
                    <Input
                        placeholder="Search workers..."
                        size="sm"
                        className="flex-1 dark text-white"
                        value={userSearchTerm}
                        onValueChange={setUserSearchTerm}
                        endContent={<IoSearchOutline className="text-light_blue-500/70" />}
                        variant="bordered"
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {usersList.length === 0 ? (
                        <div className="text-white/50 text-center py-10">
                            No workers assigned. Click &quot;Add Worker&quot; to assign workers.
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-white/50 text-center py-10">
                            No workers found matching your search.
                        </div>
                    ) : (
                        <Droppable droppableId="users" isDropDisabled={usersDisableDrop}>
                            {(provided) => (
                                <div
                                    className="flex flex-col gap-4"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {filteredUsers.map((user, index) => (
                                        <Draggable key={user.id} draggableId={`user:${user.id}`} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        zIndex: snapshot.isDragging ? 9999 : 'auto',
                                                    }}
                                                >
                                                    <WorkerCard
                                                        user={user}
                                                        tasks={tasks}
                                                        assignedTasks={taskUserLinks[user.id] || []}
                                                        onRemove={() => handleRemoveUser(user.id)}
                                                        isDropDisabled={userCardDisableDrop}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    )}
                </div>
            </div>

            {/* Right Panel - Unassigned Tasks */}
            <div className="flex-1 flex flex-col border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                        Unassigned Tasks ({unLinkedTasks.length})
                    </h3>
                    <Input
                        placeholder="Search tasks..."
                        size="sm"
                        className="w-64 dark text-white"
                        value={taskSearchTerm}
                        onValueChange={setTaskSearchTerm}
                        endContent={<IoSearchOutline className="text-light_blue-500/70" />}
                        variant="bordered"
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    <Droppable droppableId="tasks" isDropDisabled={tasksDisableDrop}>
                        {(provided, snapshot) => (
                            <div
                                className={`flex flex-col gap-3 min-h-[200px] rounded-lg transition-colors ${
                                    snapshot.isDraggingOver ? 'bg-light_blue/10 border-2 border-dashed border-light_blue/30' : ''
                                }`}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {unLinkedTasks.length === 0 ? (
                                    <div className="text-white/50 text-center py-10">
                                        {snapshot.isDraggingOver 
                                            ? "Drop here to unassign task"
                                            : "All tasks are assigned to workers."
                                        }
                                    </div>
                                ) : filteredUnlinkedTasks.length === 0 ? (
                                    <div className="text-white/50 text-center py-10">
                                        No unassigned tasks match your search.
                                    </div>
                                ) : (
                                    filteredUnlinkedTasks.map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors"
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        zIndex: snapshot.isDragging ? 9999 : 'auto',
                                                    }}
                                                >
                                                    <h4 className="text-white font-medium">{task.title}</h4>
                                                    <p className="text-white/60 text-sm line-clamp-2 mt-1">
                                                        {task.description}
                                                    </p>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </div>

            {/* Add User Modal */}
            <AddUserToProjectModal
                isOpen={isAddUserOpen}
                onOpenChange={setIsAddUserOpen}
                company_id={company_id}
                existingUserIds={usersList.map(u => u.id)}
                onAddUsers={handleAddUsers}
            />
        </div>
    );
}

// Worker Card Component
function WorkerCard({
    user,
    tasks,
    assignedTasks,
    onRemove,
    isDropDisabled,
}: {
    user: User;
    tasks: Record<string, Task>;
    assignedTasks: string[];
    onRemove: () => void;
    isDropDisabled: boolean;
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <Avatar
                        size="sm"
                        name={`${user.first_name} ${user.last_name}`}
                        className="w-8 h-8"
                        fallback={<FiUser className="text-light_blue-400" />}
                    />
                    <div>
                        <h4 className="text-white font-medium text-sm">
                            {user.first_name} {user.last_name}
                        </h4>
                        <p className="text-white/50 text-xs">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-light_blue bg-light_blue/20 px-2 py-0.5 rounded">
                        {assignedTasks.length} task{assignedTasks.length !== 1 ? 's' : ''}
                    </span>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        onPress={() => {
                            onRemove();
                        }}
                    >
                        <FiTrash2 size={14} />
                    </Button>
                </div>
            </div>

            {/* Assigned Tasks */}
            {isExpanded && (
                <Droppable droppableId={`user:${user.id}`} isDropDisabled={isDropDisabled}>
                    {(provided, snapshot) => (
                        <div
                            className={`min-h-[60px] p-2 border-t border-white/10 transition-colors ${
                                snapshot.isDraggingOver ? 'bg-light_blue/10' : ''
                            }`}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {assignedTasks.length === 0 ? (
                                <div className="text-white/30 text-center py-4 text-sm">
                                    Drop tasks here to assign
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {assignedTasks.map((taskId, index) => {
                                        const task = tasks[taskId];
                                        if (!task) return null;
                                        
                                        return (
                                            <Draggable key={taskId} draggableId={taskId} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="p-2 bg-white/5 rounded border border-white/10 cursor-grab active:cursor-grabbing"
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            zIndex: snapshot.isDragging ? 9999 : 'auto',
                                                        }}
                                                    >
                                                        <p className="text-white text-sm font-medium truncate">
                                                            {task.title}
                                                        </p>
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                </div>
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            )}
        </div>
    );
}
