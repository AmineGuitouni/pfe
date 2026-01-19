import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string;
    project_id: string;
    task_id: string;
}

interface TaskUpdateRequestBody {
    title?: string;
    description?: string;
    difficultyLevel?: number;
    task_status?: string;
    dependencies?: string[]; // Array of task IDs - will replace existing dependencies
}

export async function PATCH(request: Request, { params: { company_id, project_id, task_id, user_id } }: { params: Params }) {
    try {
        const body: TaskUpdateRequestBody = await request.json();
        
        const supabase = await getServerDBfromCompanyId(company_id, user_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Build update object with only provided fields
        const updateData: Record<string, any> = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.difficultyLevel !== undefined) updateData.difficulty_level = body.difficultyLevel;
        if (body.task_status !== undefined) updateData.task_status = body.task_status;

        // Update task fields if any
        if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
                .from("project_tasks")
                .update(updateData)
                .eq("id", task_id)
                .eq("project_id", project_id);

            if (updateError) {
                console.error("Error updating task:", updateError);
                return NextResponse.json({ error: `Failed to update task: ${updateError.message}` }, { status: 500 });
            }
        }

        // Update dependencies if provided (replace all)
        if (body.dependencies !== undefined) {
            // Delete existing dependencies for this task
            const { error: deleteDepError } = await supabase
                .from("project_tasks_dependencies")
                .delete()
                .eq("main_task_id", task_id);

            if (deleteDepError) {
                console.error("Error deleting dependencies:", deleteDepError);
            }

            // Add new dependencies if any
            if (body.dependencies.length > 0) {
                const dependencyRecords = body.dependencies.map(depId => ({
                    main_task_id: task_id,
                    dependent_task_id: depId
                }));

                const { error: insertDepError } = await supabase
                    .from("project_tasks_dependencies")
                    .insert(dependencyRecords);

                if (insertDepError) {
                    console.error("Error adding dependencies:", insertDepError);
                }
            }
        }

        // Fetch updated task with dependencies
        const { data: updatedTask, error: fetchError } = await supabase
            .from("project_tasks")
            .select(`
                id,
                title,
                description,
                difficulty_level,
                task_status,
                dependencies:project_tasks_dependencies_main_task_id_fkey(dependent_task_id)
            `)
            .eq("id", task_id)
            .single();

        if (fetchError) {
            console.error("Error fetching updated task:", fetchError);
            return NextResponse.json({ error: "Task updated but failed to fetch result" }, { status: 200 });
        }

        return NextResponse.json({ 
            data: {
                id: updatedTask.id,
                title: updatedTask.title,
                description: updatedTask.description,
                difficultyLevel: updatedTask.difficulty_level,
                task_status: updatedTask.task_status,
                dependencies: updatedTask.dependencies?.map((d: any) => d.dependent_task_id) || []
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
