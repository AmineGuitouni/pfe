export const fetchCache = "force-no-store";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string;
    company_id: string;
    project_id: string;
}

export async function GET(req: Request, { params: { company_id, project_id } }: { params: params }) {
    try {
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });

        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select(`
                id,
                name,
                description,
                deadline,
                tasks:project_tasks (
                    id,
                    title,
                    description,
                    difficulty_level,
                    task_status,
                    dependencies:project_tasks_dependencies_main_task_id_fkey(dependent_task_id)
                )
            `)
            .eq('id', project_id)
            .eq('company_id', company_id)
            .single();

        if (projectError) {
            console.error("Error fetching project:", projectError);
            if (projectError.code === 'PGRST116') {
                 return NextResponse.json({ error: `Project with ID ${project_id} not found or does not belong to company ${company_id}` }, { status: 404 });
            }
            return NextResponse.json({ error: `Failed to get project: ${projectError.message}` }, { status: 500 });
        }

        if (!projectData) {
             return NextResponse.json({ error: `Project with ID ${project_id} not found` }, { status: 404 });
        }

        const tasksMap = projectData.tasks?.reduce((acc, task)=>{
            return {...acc, [task.id]: {
                ...task,
                dependencies: task.dependencies.map(dep => dep.dependent_task_id)
            }};
        }, {} as any) || {};

        const responseData = {
            projectData: {
                id: projectData.id,
                name: projectData.name,
                description: projectData.description,
                deadline: projectData.deadline,
            },
            tasksData: Object.values(tasksMap).map((task:any)=>{
                return {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    task_status: task.task_status,
                    dependencies: task.dependencies.map((depId: string) => tasksMap[depId].title),
                    difficultyLevel: task.difficulty_level
                }
            })
        };

        return NextResponse.json(responseData);
    }
    catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}