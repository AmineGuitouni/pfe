import { AccessLevel } from "@/components/dashboard/files/types/filesTypes";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

export interface FolderUserAccessItem {
    user_id: string;
    folder_id: string;
    access_level: AccessLevel;
}

interface Params {
    user_id: string; // user_id from the path, potentially for authorization checks later
    company_id: string;
    folder_id: string;
}

export interface GetFolderAccessResponseBody {
    data?: FolderUserAccessItem[];
    error?: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
    const { company_id, folder_id } = params;

    // Basic validation for folder_id
    if (!folder_id) {
        return NextResponse.json({ error: "Folder ID is required" }, { status: 400 });
    }

    try {
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        // TODO: Add authorization check: Ensure the requesting user (user_id)
        // has permission to view access for this folder/company.

        const { data, error } = await supabase
            .from("storage_folder_user_access")
            .select("user_id, folder_id, access_level")
            // If you need user details like email/name, you'd join here:
            // .select("user_id, folder_id, access_level, users(email, name)")
            .eq("folder_id", folder_id);

        if (error) {
            console.error("Database Fetch Error:", error);
            return NextResponse.json({ error: `Failed to fetch access for folder ${folder_id}` }, { status: 500 });
        }

        const accessData: FolderUserAccessItem[] = data || [];

        return NextResponse.json({ data: accessData }, { status: 200 });

    } catch (error) {
        console.error("Internal Server Error:", error);
        // Check if error is an instance of Error to access message property safely
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
    }
}