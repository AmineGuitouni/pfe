import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string;
    company_id: string;
    project_id: string;
}

export interface DeleteProjectResponseBody {
    data: boolean
}

export async function DELETE(req: Request, {params: {company_id, project_id}}: {params: params}) {
    try{
        const supabase = await getServerDBfromCompanyId(company_id);
        if(!supabase){
            return NextResponse.json({error:"Failed to connect to database"}, {status: 500})
        }

        const {error} = await supabase
        .from("projects")
        .delete()
        .eq("id", project_id)
        .eq("company_id", company_id)

        if(error){
            console.log(error);
            return NextResponse.json({error: error.message}, {status: 500})
        }

        return NextResponse.json({data: true}, {status: 200})
    }
    catch(error){
        console.log(error)
        return NextResponse.json({error:"Internal Server Error"}, {status: 500})
    }
}