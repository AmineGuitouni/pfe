export const fetchCache = "force-no-store"

import { FileUserAccessItem } from "@/features/dashboard/files/types/filesTypes";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string;
    file_id: string;
}

export interface GetFileAccessResponseBody {
    data?: FileUserAccessItem[];
    error?: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
    const { company_id, file_id, user_id } = params;

    if (!file_id) {
        return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    try {
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        const { data, error } = await supabase
            .from("storage_file_user_access")
            .select("users!inner(id, email, first_name, last_name), file_id, access_level, storage_file!inner(owner_id)")
            .eq("file_id", file_id)
            .eq("storage_file.owner_id", user_id) as any;

        if (error) {
            console.error("Database Fetch Error:", error);
            return NextResponse.json({ error: `Failed to fetch access for file ${file_id}` }, { status: 500 });
        }

        const accessData: FileUserAccessItem[] = data.map((r:any)=>({
            user:{
                userId: r.users.id,
                fullName: `${r.users.first_name} ${r.users.last_name}`,
                email: r.users.email,
            },
            file_id: r.file_id,
            access_level: r.access_level
        })) || [];

        return NextResponse.json({ data: accessData }, { status: 200 });

    } catch (error) {
        console.error("Internal Server Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
    }
}