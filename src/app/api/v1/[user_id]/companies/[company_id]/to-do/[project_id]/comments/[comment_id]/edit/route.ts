export const fetchCache = "force-no-store"
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params: { company_id,comment_id } }: { params: { company_id: string,comment_id: string }}) {

    if (!company_id || !comment_id) return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });

    const supabase = await getServerDBfromCompanyId(company_id);
    if (!supabase) return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });

    try {
        const { body } = await request.json();
        if (!body || typeof body !== 'string' || body.trim() === '') {
            return NextResponse.json({ error: "Comment body cannot be empty" }, { status: 400 });
        }

        const { error } = await supabase
            .from("comments")
            .update({ body: body.trim() }) // Changed from upsert to update
            .eq("id", comment_id);

        if (error) {
            console.error("Supabase update error:", error);
            return NextResponse.json({ error: `Failed to update comment: ${error.message}` }, { status: 500 });
        }

    } catch (e) {
        console.error("Error processing edit request:", e);
        return NextResponse.json({ error: "Invalid request body or server error" }, { status: 400 });
    }

    return NextResponse.json({ok:true })
}