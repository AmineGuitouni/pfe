export const fetchCache = "force-no-store"
import { ProjectStatusType } from "@/components/dashboard/projects/types";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string;
    company_id: string
}

export interface ListProjectsResponseBody {
    data: {
        id: string;
        name: string;
        description: string;
        company_id: string;
        created_at: string;
        tasks_count: number
    }
}

export async function GET(request: Request, { params: { company_id, user_id } }: { params: params }) {
    const supabase = await getServerDBfromCompanyId(company_id, user_id)

    if(!supabase) return NextResponse.json({error: "Failed to connect to database"}, {status: 500});

    const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, company_id, created_at, tasks_count:project_tasks(count), deadline, task_status:project_tasks(task_status)")
    .eq("company_id", company_id)
    .order("created_at", { ascending: true });

    if(error){
        console.log(error);
        return NextResponse.json({error: `Failed to get projects: ${error.message}`}, {status: 500});
    }

    return NextResponse.json({data: data.map((project)=>({
            id: project.id,
            name: project.name,
            description: project.description,
            company_id: project.company_id,
            deadline: project.deadline,
            created_at: project.created_at,
            tasks_count: project.tasks_count[0].count,
            project_status: deriveProjectStatus(project.task_status, project.deadline)
        })
    )});
}

const deriveProjectStatus = (tasks: {task_status: string}[], deadline: string | null): ProjectStatusType => {
    if (deadline === null) {
        return "Not Started";
    }

    // If deadline exists, check task statuses
    if (!tasks || tasks.length === 0) {
        // If deadline exists but no tasks, consider it "Not Started" (or adjust as needed)
        return "Not Started";
    }

    const allCompleted = tasks.every(task => task.task_status === "Completed");
    if (allCompleted) {
        return "Completed";
    }

    return "In Progress";
};