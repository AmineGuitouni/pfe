export const fetchCache = "force-no-store"
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params: { company_id } }: { params: { company_id: string }}) {

    if(!company_id) return NextResponse.json({error: "Missing required parameters"}, {status: 400});
    
    const supabase = await getServerDBfromCompanyId(company_id)

    if(!supabase) return NextResponse.json({error: "Failed to connect to database"}, {status: 500});

    const { comment } = await request.json();

    const { data, error } = await supabase
    .from("comments")
    .insert({
        task_id: comment.task_id,
        user_id: comment.user_id,
        body : comment.body,
        reply_to : comment.reply_to || null
    })
    .select("id,created_at")
    .single();

    if(error){
        console.log(error);
        return NextResponse.json({error: `Failed to get projects: ${error.message}`}, {status: 500});
    }

    return NextResponse.json({data: data })
}