import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string;
    company_id: string;
    project_id: string;
}

export async function POST(req: Request, {params: {company_id, project_id}}: {params: params}){
    try{
        const {taskUserLinks, deadline}: {taskUserLinks: Record<string, string[] | undefined>, deadline: string} = await req.json();
        
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        const {error: projectUpdateError} = await supabase
        .from("projects")
        .update({deadline})
        .eq("id", project_id)
        .eq("company_id", company_id)

        if(projectUpdateError){
            console.log(projectUpdateError);
            return NextResponse.json({error: projectUpdateError.message}, {status: 500})
        }

        const flatendLinkls = Object.keys(taskUserLinks)
        .map((key) => taskUserLinks[key] ? taskUserLinks[key].map(
            (task_id)=>({task_id, user_id: key})
        ) : []).flat();

        const {error} = await supabase.from("project_user_tasks")
        .upsert(flatendLinkls)

        if(error){
            console.log(error);
            return NextResponse.json({error: error.message}, {status: 500})
        }

        return NextResponse.json({data: true}, {status: 200})
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error: "Something went wrong"}, {status: 500})
    }
}