import { GeneratedTask } from "@/components/dashboard/projects/types";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string;
    company_id: string
}

interface ProjectPostRequestBody {
    project:{
        name: string;
        description: string;
        deadline: string | null;
    },
    tasks: GeneratedTask[]
}

export async function POST(request: Request, { params:{company_id} }: { params: params }) {
    const {project, tasks} = await request.json() as ProjectPostRequestBody;
    
    const supabase = await getServerDBfromCompanyId(company_id)
    if(!supabase) return NextResponse.json({error: "Failed to connect to database"}, {status: 500});

    const {data: addedProject, error: projectError} = await supabase
    .from("projects")
    .insert({
        name: project.name,
        description: project.description,
        deadline: project.deadline,
        company_id: company_id
    })
    .select("id")
    .single();

    if(projectError) {
        console.log(projectError);
        return NextResponse.json({error: `Failed to add project: ${projectError.message}`}, {status: 500});
    }

    const {data:addedTasks, error: tasksError} = await supabase
    .from("project_tasks")
    .insert(tasks.map((task) => ({
        title: task.title,
        description: task.description,
        project_id: addedProject.id,
    })))
    .select("id, title");

    if(tasksError) {
        console.log(tasksError);
        return NextResponse.json({error: `Failed to add tasks: ${tasksError.message}`}, {status: 500});
    }

    const titleIdMap: Record<string, string> = addedTasks.reduce((acc, task) => ({...acc, [task.title]: task.id}), {});
    const dependencies: {main_task_id: string, dependent_task_id: string}[] = [];

    tasks.forEach((task) => {
        task.dependencies.forEach((dependency) => {
            dependencies.push({
                main_task_id: titleIdMap[task.title],
                dependent_task_id: titleIdMap[dependency]
            });
        });
    });

    const {error} = await supabase
    .from("project_tasks_dependencies")
    .insert(dependencies);

    if(error) {
        console.log(error);
        return NextResponse.json({error: `Failed to add dependencies: ${error.message}`}, {status: 500});
    }

    return NextResponse.json({sucess: true});
}