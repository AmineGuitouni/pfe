import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, {params : { company_id }}: {params: { company_id: string}}) {
    
    
    // Validate params
    if (!company_id) {
        return NextResponse.json({ 
            error: "Missing required parameters", 
            details: { company_id } 
        }, { status: 400 });
    }

    const client = await getServerDBfromCompanyId(company_id);
    
    if (!client) {
        return NextResponse.json({ 
            error: "Failed to connect to database" 
        }, { status: 500 });
    }

    // Extract request body data
    const { name,project_id,task_status } = await req.json();
    
    // Validate request body
    if (!name) {
        return NextResponse.json({ 
            error: "Missing required data in request body", 
            details: { name } 
        }, { status: 400 });
    }

    // Update task status in database
    const { data,error } = await client
        .from("columns")
        .insert({
            project_id,
            task_status ,
            name,
            company_id
        })
        .select("id,created_at")
        .single()
        

    if (error) {
        console.error(error);
        return NextResponse.json({ 
            error: error.message 
        }, { status: 500 });
    }



    return NextResponse.json({ ok: true ,id: data.id, created_at: data.created_at }, { status: 200 });
}
