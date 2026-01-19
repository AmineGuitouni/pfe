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

export async function GET(request: Request, { params: { company_id,user_id } }: { params: params}) {

    const searchParams = new URL(request.url).searchParams;
    const task_id = searchParams.get("task_id");

    if(!task_id || !company_id) return NextResponse.json({error: "Missing required parameters"}, {status: 400});
    
    const supabase = await getServerDBfromCompanyId(company_id)

    if(!supabase) return NextResponse.json({error: "Failed to connect to database"}, {status: 500});

    const { data, error } = await supabase
    .from("comments")
    .select("*,users!comments_user_id_fkey(first_name, last_name),comments_likes_dislikes(user_id,like_dislike)")
    .eq("task_id",task_id)
    .order("created_at", { ascending: false });

    if(error){
        console.log(error);
        return NextResponse.json({error: `Failed to get projects: ${error.message}`}, {status: 500});
    }

    const newData = data.map((comment) => ({
        id: comment.id,
        task_id: comment.task_id,
        body: comment.body,
        created_at: comment.created_at,
        user: {
            id: comment.user_id,
            first_name: comment.users.first_name,
            last_name: comment.users.last_name
        },
        likes : comment.comments_likes_dislikes.filter((like :any ) => like.like_dislike === "like").length,
        dislikes : comment.comments_likes_dislikes.filter((dislike : any) => dislike.like_dislike === "dislike").length,
        ownerReact : comment.comments_likes_dislikes.filter((like : any) => like.user_id === user_id).map((like : any) => like.like_dislike)[0] || null,
        reply_to: comment.reply_to,
    }))

    return NextResponse.json({data: newData })
}