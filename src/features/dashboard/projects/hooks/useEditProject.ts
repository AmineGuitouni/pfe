import { useCallback, useEffect, useState } from "react";
import { Task } from "../types";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { User } from "@/features/users/types/types";

interface UseEditProjectProps {
    company_id: string;
    project_id: string;
}

interface ProjectData {
    id: string;
    name: string;
    description: string;
    deadline: string | null;
}

interface DependentTask {
    id: string;
    title: string;
}

export type DeleteMode = "cancel" | "cascade" | "remove_dependency";

export default function useEditProject({ company_id, project_id }: UseEditProjectProps) {
    const [project, setProject] = useState<ProjectData | null>(null);
    const [tasks, setTasks] = useState<Record<string, Task>>({});
    const [taskUserLinks, setTaskUserLinks] = useState<Record<string, string[]>>({});
    const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: session } = useSession();

    // Fetch project data
    const fetchProjectData = useCallback(async () => {
        if (!session?.user.id) return;

        try {
            setIsLoading(true);
            setError(null);

            // Fetch project details and tasks
            const projectRes = await fetch(
                `/api/v1/${session.user.id}/companies/${company_id}/projects/${project_id}/get`
            );

            if (!projectRes.ok) {
                throw new Error("Failed to fetch project data");
            }

            const projectData = await projectRes.json();

            setProject({
                id: projectData.projectData.id,
                name: projectData.projectData.name,
                description: projectData.projectData.description,
                deadline: projectData.projectData.deadline,
            });

            // Transform tasks data
            const tasksMap: Record<string, Task> = {};
            projectData.tasksData.forEach((task: any) => {
                tasksMap[task.id] = {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    dependencies: task.dependencies || [],
                    difficultyLevel: task.difficultyLevel,
                    task_status: task.task_status,
                    assigned_users: task.assigned_users || [],
                    checked: false,
                };
            });
            setTasks(tasksMap);

            // Fetch current assignments
            const assignRes = await fetch(
                `/api/v1/${session.user.id}/companies/${company_id}/projects/${project_id}/tasks/reassign`
            );

            if (assignRes.ok) {
                const assignData = await assignRes.json();
                setTaskUserLinks(assignData.data.taskUserLinks || {});
                setAssignedUsers(assignData.data.users || []);
            }
        } catch (err: any) {
            console.error("Error fetching project:", err);
            setError(err.message || "Failed to load project");
        } finally {
            setIsLoading(false);
        }
    }, [session?.user.id, company_id, project_id]);

    useEffect(() => {
        fetchProjectData();
    }, [fetchProjectData]);

    // Update project details
    const updateProject = useCallback(async (data: Partial<ProjectData>) => {
        if (!session?.user.id || !project) return false;

        try {
            setIsSaving(true);
            const res = await fetch(
                `/api/v1/${session.user.id}/companies/${company_id}/projects/${project_id}/update`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update project");
            }

            const result = await res.json();
            setProject(prev => prev ? { ...prev, ...result.data } : null);
            toast.success("Project updated successfully");
            return true;
        } catch (err: any) {
            console.error("Error updating project:", err);
            toast.error(err.message || "Failed to update project");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [session?.user.id, company_id, project_id, project]);

    // Add new task
    const addTask = useCallback(async (taskData: {
        title: string;
        description: string;
        difficultyLevel: number;
        dependencies?: string[];
    }) => {
        if (!session?.user.id) return null;

        try {
            setIsSaving(true);
            const res = await fetch(
                `/api/v1/${session.user.id}/companies/${company_id}/projects/${project_id}/tasks/add`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(taskData),
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to add task");
            }

            const result = await res.json();
            const newTask: Task = {
                id: result.data.id,
                title: result.data.title,
                description: result.data.description,
                dependencies: result.data.dependencies || [],
                difficultyLevel: result.data.difficultyLevel,
                task_status: result.data.task_status,
                checked: false,
            };

            setTasks(prev => ({ ...prev, [newTask.id]: newTask }));
            toast.success("Task added successfully");
            return newTask;
        } catch (err: any) {
            console.error("Error adding task:", err);
            toast.error(err.message || "Failed to add task");
            return null;
        } finally {
            setIsSaving(false);
        }
    }, [session?.user.id, company_id, project_id]);

    // Update task
    const updateTask = useCallback(async (taskId: string, taskData: Partial<Task>) => {
        if (!session?.user.id) return false;

        try {
            setIsSaving(true);
            const res = await fetch(
                `/api/v1/${session.user.id}/companies/${company_id}/projects/${project_id}/tasks/${taskId}/update`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(taskData),
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update task");
            }

            const result = await res.json();
            setTasks(prev => ({
                ...prev,
                [taskId]: {
                    ...prev[taskId],
                    ...result.data,
                    dependencies: result.data.dependencies || prev[taskId].dependencies,
                },
            }));
            toast.success("Task updated successfully");
            return true;
        } catch (err: any) {
            console.error("Error updating task:", err);
            toast.error(err.message || "Failed to update task");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [session?.user.id, company_id, project_id]);

    // Check task dependencies before delete
    const checkTaskDependencies = useCallback(async (taskId: string): Promise<{
        hasDependents: boolean;
        dependentTasks: DependentTask[];
    }> => {
        if (!session?.user.id) return { hasDependents: false, dependentTasks: [] };

        try {
            const res = await fetch(
                `/api/v1/${session.user.id}/companies/${company_id}/projects/${project_id}/tasks/${taskId}/delete`
            );

            if (!res.ok) {
                throw new Error("Failed to check dependencies");
            }

            const result = await res.json();
            return result.data;
        } catch (err) {
            console.error("Error checking dependencies:", err);
            return { hasDependents: false, dependentTasks: [] };
        }
    }, [session?.user.id, company_id, project_id]);

    // Delete task
    const deleteTask = useCallback(async (taskId: string, mode: DeleteMode): Promise<{
        success: boolean;
        deletedTasks?: string[];
    }> => {
        if (!session?.user.id) return { success: false };

        try {
            setIsSaving(true);
            const res = await fetch(
                `/api/v1/${session.user.id}/companies/${company_id}/projects/${project_id}/tasks/${taskId}/delete`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mode }),
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete task");
            }

            const result = await res.json();
            const deletedTasks = result.data.deletedTasks || [taskId];

            // Remove deleted tasks from state
            setTasks(prev => {
                const newTasks = { ...prev };
                deletedTasks.forEach((id: string) => {
                    delete newTasks[id];
                });

                // Update dependencies in remaining tasks
                Object.keys(newTasks).forEach(id => {
                    const task = newTasks[id];
                    if (task.dependencies) {
                        // Filter out deleted task titles from dependencies
                        const deletedTitles = deletedTasks.map((delId: string) => prev[delId]?.title).filter(Boolean);
                        newTasks[id] = {
                            ...task,
                            dependencies: task.dependencies.filter(dep => !deletedTitles.includes(dep))
                        };
                    }
                });

                return newTasks;
            });

            // Remove from taskUserLinks
            setTaskUserLinks(prev => {
                const newLinks = { ...prev };
                Object.keys(newLinks).forEach(userId => {
                    newLinks[userId] = newLinks[userId].filter(tId => !deletedTasks.includes(tId));
                });
                return newLinks;
            });

            toast.success(deletedTasks.length > 1 
                ? `${deletedTasks.length} tasks deleted successfully` 
                : "Task deleted successfully"
            );
            return { success: true, deletedTasks };
        } catch (err: any) {
            console.error("Error deleting task:", err);
            toast.error(err.message || "Failed to delete task");
            return { success: false };
        } finally {
            setIsSaving(false);
        }
    }, [session?.user.id, company_id, project_id]);

    // Save worker reassignments
    const saveReassignments = useCallback(async (links: Record<string, string[]>) => {
        if (!session?.user.id) return false;

        try {
            setIsSaving(true);
            const res = await fetch(
                `/api/v1/${session.user.id}/companies/${company_id}/projects/${project_id}/tasks/reassign`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ taskUserLinks: links }),
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save assignments");
            }

            setTaskUserLinks(links);
            toast.success("Worker assignments saved successfully");
            return true;
        } catch (err: any) {
            console.error("Error saving assignments:", err);
            toast.error(err.message || "Failed to save assignments");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [session?.user.id, company_id, project_id]);

    // Add user to assignment list
    const addUserToAssignment = useCallback((user: User) => {
        setAssignedUsers(prev => {
            if (prev.some(u => u.id === user.id)) return prev;
            return [...prev, user];
        });
        setTaskUserLinks(prev => ({
            ...prev,
            [user.id]: prev[user.id] || []
        }));
    }, []);

    // Remove user from assignment list
    const removeUserFromAssignment = useCallback((userId: string) => {
        setAssignedUsers(prev => prev.filter(u => u.id !== userId));
        setTaskUserLinks(prev => {
            const newLinks = { ...prev };
            delete newLinks[userId];
            return newLinks;
        });
    }, []);

    // Update task user links locally
    const updateTaskUserLinks = useCallback((links: Record<string, string[]>) => {
        setTaskUserLinks(links);
    }, []);

    return {
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
        updateTaskUserLinks,
        refetch: fetchProjectData,
    };
}
