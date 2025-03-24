import { Task } from "@/components/dashboard/projects/types";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string,
    company_id: string,
    project_id: string
}

export async function GET(req: Request, {params: {company_id, project_id}}: {params: params}) {
    try{
        const supabase = await getServerDBfromCompanyId(company_id);
        if(!supabase) return NextResponse.json({error: "Failed to connect to database"}, {status: 500});

        const {data, error} = await supabase.from("project_tasks")
        .select("id, title, description, difficulty_level, project_tasks_dependencies!project_tasks_dependencies_main_task_id_fkey(dependent_task_id)")
        .eq("project_id", project_id);

        if(error){
            console.log(error);
            return NextResponse.json({error: `Failed to get tasks: ${error.message}`}, {status: 500});
        }

        return NextResponse.json({data:data.map((task)=>({
            id: task.id,
            title: task.title,
            description: task.description,
            difficultyLevel: task.difficulty_level,
            dependencies: task.project_tasks_dependencies.map((dependency) => dependency.dependent_task_id),
            task_status: "To Do"
        }) as Task)}, {status: 200});
    }
    catch(e){
        console.log(e);
        return NextResponse.json({error: "Something went wrong"}, {status: 500})
    }
}