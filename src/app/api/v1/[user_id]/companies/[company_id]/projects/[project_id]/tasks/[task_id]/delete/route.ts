import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string;
    project_id: string;
    task_id: string;
}

type DeleteMode = "cancel" | "cascade" | "remove_dependency";

interface TaskDeleteRequestBody {
    mode: DeleteMode;
}

export async function DELETE(request: Request, { params: { company_id, project_id, task_id, user_id } }: { params: Params }) {
    try {
        const body: TaskDeleteRequestBody = await request.json();
        const { mode } = body;
        
        const supabase = await getServerDBfromCompanyId(company_id, user_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Check for tasks that depend on this task
        const { data: dependentTasks, error: depCheckError } = await supabase
            .from("project_tasks_dependencies")
            .select(`
                main_task_id,
                main_task:project_tasks!project_tasks_dependencies_main_task_id_fkey(id, title)
            `)
            .eq("dependent_task_id", task_id);

        if (depCheckError) {
            console.error("Error checking dependencies:", depCheckError);
            return NextResponse.json({ error: "Failed to check task dependencies" }, { status: 500 });
        }

        const hasDependents = dependentTasks && dependentTasks.length > 0;

        if (hasDependents && mode === "cancel") {
            return NextResponse.json({ 
                error: "Task has dependent tasks",
                dependentTasks: dependentTasks.map(d => ({
                    id: d.main_task_id,
                    title: (d.main_task as any)?.title
                }))
            }, { status: 400 });
        }

        if (mode === "cascade" && hasDependents) {
            // Get all tasks to delete (recursive cascade)
            const tasksToDelete = await getTasksToDeleteCascade(supabase, task_id);
            
            // Delete in correct order (leaf tasks first)
            for (const taskIdToDelete of tasksToDelete.reverse()) {
                // Delete user assignments
                await supabase
                    .from("project_user_tasks")
                    .delete()
                    .eq("task_id", taskIdToDelete);

                // Delete task history
                await supabase
                    .from("project_task_history")
                    .delete()
                    .eq("task_id", taskIdToDelete);

                // Delete dependencies where this task is the dependent
                await supabase
                    .from("project_tasks_dependencies")
                    .delete()
                    .eq("dependent_task_id", taskIdToDelete);

                // Delete dependencies where this task is the main task
                await supabase
                    .from("project_tasks_dependencies")
                    .delete()
                    .eq("main_task_id", taskIdToDelete);

                // Delete comments
                await supabase
                    .from("comments")
                    .delete()
                    .eq("task_id", taskIdToDelete);

                // Delete the task
                await supabase
                    .from("project_tasks")
                    .delete()
                    .eq("id", taskIdToDelete);
            }

            return NextResponse.json({ 
                data: { 
                    deleted: true, 
                    deletedTasks: tasksToDelete 
                }
            }, { status: 200 });
        }

        if (mode === "remove_dependency" && hasDependents) {
            // Remove this task from dependencies of other tasks
            const { error: removeDepError } = await supabase
                .from("project_tasks_dependencies")
                .delete()
                .eq("dependent_task_id", task_id);

            if (removeDepError) {
                console.error("Error removing dependencies:", removeDepError);
                return NextResponse.json({ error: "Failed to remove dependencies" }, { status: 500 });
            }
        }

        // Delete user assignments
        await supabase
            .from("project_user_tasks")
            .delete()
            .eq("task_id", task_id);

        // Delete task history
        await supabase
            .from("project_task_history")
            .delete()
            .eq("task_id", task_id);

        // Delete dependencies where this task is the main task
        await supabase
            .from("project_tasks_dependencies")
            .delete()
            .eq("main_task_id", task_id);

        // Delete dependencies where this task is the dependent (if not already done)
        await supabase
            .from("project_tasks_dependencies")
            .delete()
            .eq("dependent_task_id", task_id);

        // Delete comments
        await supabase
            .from("comments")
            .delete()
            .eq("task_id", task_id);

        // Delete the task
        const { error: deleteError } = await supabase
            .from("project_tasks")
            .delete()
            .eq("id", task_id)
            .eq("project_id", project_id);

        if (deleteError) {
            console.error("Error deleting task:", deleteError);
            return NextResponse.json({ error: `Failed to delete task: ${deleteError.message}` }, { status: 500 });
        }

        return NextResponse.json({ data: { deleted: true, deletedTasks: [task_id] } }, { status: 200 });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Helper to check dependencies before delete (GET request)
export async function GET(request: Request, { params: { company_id, project_id, task_id, user_id } }: { params: Params }) {
    try {
        const supabase = await getServerDBfromCompanyId(company_id, user_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Check for tasks that depend on this task
        const { data: dependentTasks, error: depCheckError } = await supabase
            .from("project_tasks_dependencies")
            .select(`
                main_task_id,
                main_task:project_tasks!project_tasks_dependencies_main_task_id_fkey(id, title)
            `)
            .eq("dependent_task_id", task_id);

        if (depCheckError) {
            console.error("Error checking dependencies:", depCheckError);
            return NextResponse.json({ error: "Failed to check task dependencies" }, { status: 500 });
        }

        return NextResponse.json({ 
            data: {
                hasDependents: dependentTasks && dependentTasks.length > 0,
                dependentTasks: dependentTasks?.map(d => ({
                    id: d.main_task_id,
                    title: (d.main_task as any)?.title
                })) || []
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Recursive function to get all tasks that need to be deleted in cascade
async function getTasksToDeleteCascade(supabase: any, taskId: string, visited: Set<string> = new Set()): Promise<string[]> {
    if (visited.has(taskId)) return [];
    visited.add(taskId);

    const result: string[] = [taskId];

    // Find tasks that have this task as a dependency
    const { data: dependentTasks } = await supabase
        .from("project_tasks_dependencies")
        .select("main_task_id")
        .eq("dependent_task_id", taskId);

    if (dependentTasks) {
        for (const dep of dependentTasks) {
            const cascadeTasks = await getTasksToDeleteCascade(supabase, dep.main_task_id, visited);
            result.push(...cascadeTasks);
        }
    }

    return result;
}
