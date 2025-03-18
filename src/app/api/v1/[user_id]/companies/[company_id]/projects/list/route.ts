export const fetchCache = "force-no-store"
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

export async function GET(request: Request, { params: { company_id } }: { params: params }) {
    const supabase = await getServerDBfromCompanyId(company_id)

    if(!supabase) return NextResponse.json({error: "Failed to connect to database"}, {status: 500});

    const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, company_id, created_at, tasks:project_tasks(count)")
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
        created_at: project.created_at,
        tasks_count: project.tasks[0].count
    }))});
}