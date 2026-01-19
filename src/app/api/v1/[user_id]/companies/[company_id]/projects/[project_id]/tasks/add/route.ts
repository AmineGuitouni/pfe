import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string;
    project_id: string;
}

interface TaskCreateRequestBody {
    title: string;
    description: string;
    difficultyLevel: number;
    dependencies?: string[]; // Array of task IDs
}

export async function POST(request: Request, { params: { company_id, project_id, user_id } }: { params: Params }) {
    try {
        const body: TaskCreateRequestBody = await request.json();
        
        const supabase = await getServerDBfromCompanyId(company_id, user_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Get the "To Do" column for this project
        const { data: column, error: columnError } = await supabase
            .from("columns")
            .select("id")
            .eq("project_id", project_id)
            .eq("task_status", "To Do")
            .single();

        if (columnError || !column) {
            console.error("Error finding column:", columnError);
            return NextResponse.json({ error: "Failed to find project column" }, { status: 500 });
        }

        // Create the task
        const { data: newTask, error: taskError } = await supabase
            .from("project_tasks")
            .insert({
                title: body.title,
                description: body.description,
                difficulty_level: body.difficultyLevel,
                project_id: project_id,
                column_id: column.id,
                task_status: "To Do"
            })
            .select("id, title, description, difficulty_level, task_status")
            .single();

        if (taskError) {
            console.error("Error creating task:", taskError);
            return NextResponse.json({ error: `Failed to create task: ${taskError.message}` }, { status: 500 });
        }

        // Add dependencies if provided
        if (body.dependencies && body.dependencies.length > 0) {
            const dependencyRecords = body.dependencies.map(depId => ({
                main_task_id: newTask.id,
                dependent_task_id: depId
            }));

            const { error: depError } = await supabase
                .from("project_tasks_dependencies")
                .insert(dependencyRecords);

            if (depError) {
                console.error("Error adding dependencies:", depError);
                // Don't fail the entire request, task is created
            }
        }

        return NextResponse.json({ 
            data: {
                id: newTask.id,
                title: newTask.title,
                description: newTask.description,
                difficultyLevel: newTask.difficulty_level,
                task_status: newTask.task_status,
                dependencies: body.dependencies || []
            }
        }, { status: 201 });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
