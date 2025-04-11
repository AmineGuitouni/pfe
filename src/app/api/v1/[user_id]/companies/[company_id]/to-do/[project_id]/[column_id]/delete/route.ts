import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, {params : { company_id,column_id }}: {params: { company_id: string,column_id: string}}) {
    
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
    
    const { error } = await client
        .from("columns")
        .delete()
        .eq("id", column_id)
        

    if (error) {
        console.error(error);
        return NextResponse.json({ 
            error: error.message 
        }, { status: 500 });
    }



    return NextResponse.json({ ok: true }, { status: 200 });
}
