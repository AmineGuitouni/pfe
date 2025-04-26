import { AccessLevel } from "@/components/dashboard/files/types/filesTypes";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string;
    file_id: string;
}

export interface GetFileAccessResponseBody {
    error?: string;
}

export async function POST(req: Request, { params }: { params: Params }) {
    const { company_id, file_id } = params;

    if (!file_id) {
        return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    try {
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        const {userToAdd, userToRemove}:{
            userToAdd: {user_id:string, access_level:AccessLevel}[],
            userToRemove: {user_id:string}[]
        } = await req.json();

        const {error} = await supabase.from("storage_file_user_access")
        .upsert(userToAdd.map((user)=>({
            file_id,
            user_id: user.user_id,
            access_level: user.access_level
        })))

        if(error){
            console.error("Database Insert Error:", error);
            return NextResponse.json({ error: `Failed to update access for file ${file_id}` }, { status: 500 });
        }

        const {error: removeError} = await supabase.from("storage_file_user_access")
        .delete()
        .eq("file_id", file_id)
        .in("user_id", userToRemove.map((user)=>user.user_id))

        if(removeError){
            console.error("Database Delete Error:", removeError);
            return NextResponse.json({ error: `Failed to update access for file ${file_id}` }, { status: 500 });
        }

        return NextResponse.json({}, { status: 200 });

    } catch (error) {
        console.error("Internal Server Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
    }
}