export const fetchCache = "force-no-store"
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params: { company_id,comment_id } }: { params: { company_id: string , comment_id: string }}) {

    if(!company_id) return NextResponse.json({error: "Missing required parameters"}, {status: 400});
    
    const supabase = await getServerDBfromCompanyId(company_id)

    if(!supabase) return NextResponse.json({error: "Failed to connect to database"}, {status: 500})

    const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", comment_id)

    if(error){
        console.log(error);
        return NextResponse.json({error: `Failed to get projects: ${error.message}`}, {status: 500});
    }

    return NextResponse.json({ok:true })
}