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

    // Get the current max order for this project to set the new column order
    const { data: existingColumns } = await client
        .from("columns")
        .select("column_order")
        .eq("project_id", project_id)
        .order("column_order", { ascending: false })
        .limit(1);

    const nextOrder = existingColumns && existingColumns.length > 0
        ? (existingColumns[0].column_order || 0) + 1
        : 0;

    // Insert new column with calculated order
    const { data,error } = await client
        .from("columns")
        .insert({
            project_id,
            task_status ,
            name,
            company_id,
            column_order: nextOrder
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
