import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string;
    project_id: string;
}

interface ReassignRequestBody {
    taskUserLinks: Record<string, string[] | undefined>; // userId -> taskIds[]
}

export async function POST(request: Request, { params: { company_id, project_id, user_id } }: { params: Params }) {
    try {
        const { taskUserLinks }: ReassignRequestBody = await request.json();
        
        const supabase = await getServerDBfromCompanyId(company_id, user_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Get all tasks for this project to validate
        const { data: projectTasks, error: tasksError } = await supabase
            .from("project_tasks")
            .select("id")
            .eq("project_id", project_id);

        if (tasksError) {
            console.error("Error fetching project tasks:", tasksError);
            return NextResponse.json({ error: "Failed to fetch project tasks" }, { status: 500 });
        }

        const validTaskIds = new Set(projectTasks?.map(t => t.id) || []);

        // Get all current assignments for this project's tasks
        const { data: currentAssignments, error: currentError } = await supabase
            .from("project_user_tasks")
            .select("task_id, user_id")
            .in("task_id", Array.from(validTaskIds));

        if (currentError) {
            console.error("Error fetching current assignments:", currentError);
        }

        // Calculate new assignments
        const newAssignments: { task_id: string; user_id: string }[] = [];
        
        Object.entries(taskUserLinks).forEach(([userId, taskIds]) => {
            if (taskIds) {
                taskIds.forEach(taskId => {
                    if (validTaskIds.has(taskId)) {
                        newAssignments.push({ task_id: taskId, user_id: userId });
                    }
                });
            }
        });

        // Create sets for comparison
        const currentSet = new Set(
            currentAssignments?.map(a => `${a.task_id}:${a.user_id}`) || []
        );
        const newSet = new Set(
            newAssignments.map(a => `${a.task_id}:${a.user_id}`)
        );

        // Determine what to add and remove
        const toAdd = newAssignments.filter(a => !currentSet.has(`${a.task_id}:${a.user_id}`));
        const toRemove = (currentAssignments || []).filter(
            a => !newSet.has(`${a.task_id}:${a.user_id}`)
        );

        // Remove old assignments
        for (const assignment of toRemove) {
            const { error: removeError } = await supabase
                .from("project_user_tasks")
                .delete()
                .eq("task_id", assignment.task_id)
                .eq("user_id", assignment.user_id);

            if (removeError) {
                console.error("Error removing assignment:", removeError);
            }
        }

        // Add new assignments
        if (toAdd.length > 0) {
            const { error: addError } = await supabase
                .from("project_user_tasks")
                .insert(toAdd);

            if (addError) {
                console.error("Error adding assignments:", addError);
                return NextResponse.json({ error: `Failed to add assignments: ${addError.message}` }, { status: 500 });
            }

            // Add to task history for newly assigned tasks
            const historyRecords = toAdd.map(link => ({
                task_id: link.task_id,
                status: "todo"
            }));

            await supabase
                .from("project_task_history")
                .insert(historyRecords);
        }

        return NextResponse.json({ 
            data: { 
                success: true,
                added: toAdd.length,
                removed: toRemove.length
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET endpoint to fetch current assignments
export async function GET(request: Request, { params: { company_id, project_id, user_id } }: { params: Params }) {
    try {
        const supabase = await getServerDBfromCompanyId(company_id, user_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Get all tasks with their assignments for this project
        const { data: tasksWithAssignments, error } = await supabase
            .from("project_tasks")
            .select(`
                id,
                title,
                assignments:project_user_tasks(
                    user_id,
                    user:users(id, first_name, last_name, email, image, phone_number)
                )
            `)
            .eq("project_id", project_id);

        if (error) {
            console.error("Error fetching assignments:", error);
            return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
        }

        // Transform to taskUserLinks format
        const taskUserLinks: Record<string, string[]> = {};
        const usersMap: Record<string, any> = {};

        tasksWithAssignments?.forEach(task => {
            task.assignments?.forEach((assignment: any) => {
                const userId = assignment.user_id;
                if (!taskUserLinks[userId]) {
                    taskUserLinks[userId] = [];
                }
                taskUserLinks[userId].push(task.id);

                if (assignment.user && !usersMap[userId]) {
                    usersMap[userId] = assignment.user;
                }
            });
        });

        return NextResponse.json({ 
            data: {
                taskUserLinks,
                users: Object.values(usersMap)
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
