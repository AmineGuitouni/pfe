import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, {params : { company_id, project_id }}: {params: { company_id: string, project_id: string}}) {
    
    
    // Validate params
    if (!company_id || !project_id) {
        return NextResponse.json({ 
            error: "Missing required parameters", 
            details: { company_id, project_id } 
        }, { status: 400 });
    }

    const client = await getServerDBfromCompanyId(company_id);
    
    if (!client) {
        return NextResponse.json({ 
            error: "Failed to connect to database" 
        }, { status: 500 });
    }

    // Extract request body data
    const { checked, task_id} = await req.json();
    
    // Validate request body
    if ( !task_id) {
        return NextResponse.json({ 
            error: "Missing required data in request body", 
            details: { task_id } 
        }, { status: 400 });
    }

    console.log({ 
        checked,
        task_id, 
        project_id, 
        company_id 
    });

    // Update task status in database
    const { error } = await client
        .from("project_tasks")
        .update({ 
            checked: checked
        })
        .eq("project_id", project_id)
        .eq("id", task_id);

    if (error) {
        console.error(error);
        return NextResponse.json({ 
            error: error.message 
        }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
