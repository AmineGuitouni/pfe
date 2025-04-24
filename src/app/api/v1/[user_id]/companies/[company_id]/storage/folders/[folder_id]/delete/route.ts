import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string;
    company_id: string;
    folder_id: string;
}

export interface DeleteFolderResponseBody {
    message?: string;
    error?: string;
}

export async function DELETE(req: Request, { params: { company_id, folder_id ,user_id } }: { params: params }) {
    try {
        const supabase = await getServerDBfromCompanyId(company_id,user_id);
        if (!supabase) {
            return NextResponse.json<DeleteFolderResponseBody>({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Check if folder_id is provided
        if (!folder_id) {
            return NextResponse.json<DeleteFolderResponseBody>({ error: "Folder ID is required" }, { status: 400 });
        }

        // Perform the delete operation
        const { error } = await supabase
            .from("storage_folders")
            .delete()
            .eq("id", folder_id);

        if (error) {
            console.error("Error deleting folder:", error);
            // Check for specific errors, e.g., foreign key violation if folder is not empty
            if (error.code === '23503') { // Foreign key violation
                 return NextResponse.json<DeleteFolderResponseBody>({ error: "Cannot delete folder: It may contain files or subfolders." }, { status: 409 }); // Conflict
            }
            return NextResponse.json<DeleteFolderResponseBody>({ error: "Failed to delete folder" }, { status: 500 });
        }

        return NextResponse.json<DeleteFolderResponseBody>({ message: "Folder deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json<DeleteFolderResponseBody>({ error: "Internal Server Error" }, { status: 500 });
    }
}