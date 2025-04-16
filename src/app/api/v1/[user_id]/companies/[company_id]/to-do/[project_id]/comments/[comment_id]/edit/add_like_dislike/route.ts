export const fetchCache = "force-no-store"
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params: { company_id,comment_id,user_id } }: { params: { company_id: string,comment_id: string,user_id: string }}) {

    if (!company_id || !comment_id) return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });

    const supabase = await getServerDBfromCompanyId(company_id);
    if (!supabase) return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });

    try {
        const { like_dislike} = await request.json();
        
        if (!like_dislike ) {
            return NextResponse.json({ error: "Comment body cannot be empty" }, { status: 400 });
        }

        if(like_dislike === "like" || like_dislike === "dislike"){
            const { error } = await supabase
            .from("comments_likes_dislikes")
            .upsert({ user_id , comment_id , like_dislike  }) 

            if (error) {
                console.error("Supabase update error:", error);
                return NextResponse.json({ error: `Failed to update comment: ${error.message}` }, { status: 500 });
            }}
        else{
            const { error } = await supabase
            .from("comments_likes_dislikes")
            .delete()
            .eq("user_id", user_id)
            .eq("comment_id", comment_id)

            if(error){
                console.error("Supabase delete error:", error);
                return NextResponse.json({ error: `Failed to delete comment: ${error.message}` }, { status: 500 });
            }
        }
       
    } catch (e) {
        console.error("Error processing edit request:", e);
        return NextResponse.json({ error: "Invalid request body or server error" }, { status: 400 });
    }

    return NextResponse.json({ok:true })

}