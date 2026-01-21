"use client"

import { Button, Spinner, useDisclosure, Tabs, Tab } from "@heroui/react";
import { FiEdit, FiPlus, FiSave, FiArrowLeft, FiUsers, FiList } from "react-icons/fi";
import Link from "next/link";
import { useParams } from "next/navigation";
import useEditProject from "@/features/dashboard/projects/hooks/useEditProject";
import EditProjectDetailsModal from "@/features/dashboard/projects/components/modals/EditProjectDetailsModal";
import AddTaskToProjectModal from "@/features/dashboard/projects/components/modals/AddTaskToProjectModal";
import EditableTaskItem from "@/features/dashboard/projects/components/edit/EditableTaskItem";
import WorkerReassignment from "@/features/dashboard/projects/components/edit/WorkerReassignment";
import { useState, useEffect } from "react";

export default function EditProjectPage() {
    const params = useParams();
    const locale = params.locale as string;
    const company = params.company as string;
    const project_id = params.project_id as string;

    const {
        project,
        tasks,
        taskUserLinks,
        assignedUsers,
        isLoading,
        isSaving,
        error,
        updateProject,
        addTask,
        updateTask,
        deleteTask,
        checkTaskDependencies,
        saveReassignments,
        addUserToAssignment,
        removeUserFromAssignment,
    } = useEditProject({ company_id: company, project_id });

    const { isOpen: isEditDetailsOpen, onOpen: onEditDetailsOpen, onOpenChange: onEditDetailsChange } = useDisclosure();
    const { isOpen: isAddTaskOpen, onOpen: onAddTaskOpen, onOpenChange: onAddTaskChange } = useDisclosure();
    
    const [activeTab, setActiveTab] = useState("tasks");
    const [localTaskUserLinks, setLocalTaskUserLinks] = useState<Record<string, string[]>>(taskUserLinks);
    const [hasAssignmentChanges, setHasAssignmentChanges] = useState(false);

    // Update local links when initial data loads
    useEffect(() => {
        if (Object.keys(taskUserLinks).length > 0 || !isLoading) {
            setLocalTaskUserLinks(taskUserLinks);
            setHasAssignmentChanges(false);
        }
    }, [taskUserLinks, isLoading]);

    const handleSaveAssignments = async () => {
        const success = await saveReassignments(localTaskUserLinks);
        if (success) {
            setHasAssignmentChanges(false);
        }
    };

    const handleLinksChange = (links: Record<string, string[]>) => {
        setLocalTaskUserLinks(links);
        setHasAssignmentChanges(true);
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white">
                <p className="text-red-500">{error || "Failed to load project"}</p>
                <Link
                    href={`/${locale}/dashboard/${company}/projects`}
                    className="text-light_blue hover:underline"
                >
                    Return to Projects
                </Link>
            </div>
        );
    }

    const tasksList = Object.values(tasks);

    return (
        <div className="w-full h-full overflow-hidden flex flex-col">
            {/* Header */}
            <header className="flex-shrink-0 px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/${locale}/dashboard/${company}/projects/${project_id}`}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                        >
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Edit Project
                            </h1>
                            <p className="text-light_blue-400 text-sm">
                                {project.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="bordered"
                            radius="sm"
                            className="dark text-white border-white/20 hover:bg-white/10"
                            startContent={<FiEdit size={16} />}
                            onPress={onEditDetailsOpen}
                        >
                            Edit Details
                        </Button>
                        {activeTab === "assignments" && hasAssignmentChanges && (
                            <Button
                                color="primary"
                                radius="sm"
                                className="bg-light_blue text-black font-semibold"
                                startContent={<FiSave size={16} />}
                                isLoading={isSaving}
                                onPress={handleSaveAssignments}
                            >
                                Save Assignments
                            </Button>
                        )}
                    </div>
                </div>

                {/* Project Info Summary */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-white/60">Tasks:</span>
                        <span className="ml-2 text-white font-medium">{tasksList.length}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-white/60">Workers:</span>
                        <span className="ml-2 text-white font-medium">{assignedUsers.length}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-white/60">Deadline:</span>
                        <span className="ml-2 text-white font-medium">
                            {project.deadline || "Not set"}
                        </span>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as string)}
                    variant="underlined"
                    classNames={{
                        base: "w-full px-6 pt-4 border-b border-white/10",
                        tabList: "gap-6",
                        tab: "text-white/60 data-[selected=true]:text-light_blue data-[hover=true]:text-white",
                        cursor: "bg-light_blue",
                        tabContent: "text-white/60 group-data-[selected=true]:text-light_blue",
                    }}
                >
                    <Tab
                        key="tasks"
                        title={
                            <div className="flex items-center gap-2 text-inherit">
                                <FiList size={16} />
                                <span>Tasks</span>
                            </div>
                        }
                    />
                    <Tab
                        key="assignments"
                        title={
                            <div className="flex items-center gap-2 text-inherit">
                                <FiUsers size={16} />
                                <span>Worker Assignments</span>
                                {hasAssignmentChanges && (
                                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                )}
                            </div>
                        }
                    />
                </Tabs>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "tasks" && (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">
                                    Project Tasks ({tasksList.length})
                                </h2>
                                <Button
                                    color="primary"
                                    radius="sm"
                                    className="bg-light_blue text-black font-semibold"
                                    startContent={<FiPlus size={16} />}
                                    onPress={onAddTaskOpen}
                                >
                                    Add Task
                                </Button>
                            </div>

                            {tasksList.length === 0 ? (
                                <div className="text-center py-12 text-white/50">
                                    <FiList size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No tasks yet. Add your first task to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tasksList.map((task) => (
                                        <EditableTaskItem
                                            key={task.id}
                                            task={task}
                                            tasks={tasks}
                                            onEditTask={updateTask}
                                            onDeleteTask={deleteTask}
                                            onCheckDependencies={checkTaskDependencies}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "assignments" && (
                        <WorkerReassignment
                            company_id={company}
                            tasks={tasks}
                            initialTaskUserLinks={taskUserLinks}
                            initialUsers={assignedUsers}
                            onLinksChange={handleLinksChange}
                            onAddUser={addUserToAssignment}
                            onRemoveUser={removeUserFromAssignment}
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            {project && (
                <EditProjectDetailsModal
                    project={project}
                    isOpen={isEditDetailsOpen}
                    onOpenChange={onEditDetailsChange}
                    onSave={updateProject}
                />
            )}

            <AddTaskToProjectModal
                isOpen={isAddTaskOpen}
                onOpenChange={onAddTaskChange}
                tasks={tasks}
                onAddTask={addTask}
            />
        </div>
    );
}
