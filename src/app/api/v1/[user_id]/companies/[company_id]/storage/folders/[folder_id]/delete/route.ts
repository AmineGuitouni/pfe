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

export async function DELETE(req: Request, { params: { company_id, user_id, folder_id } }: { params: params }) { // Added user_id
    try {
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json<DeleteFolderResponseBody>({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Check if folder_id is provided
        if (!folder_id) {
            return NextResponse.json<DeleteFolderResponseBody>({ error: "Folder ID is required" }, { status: 400 });
        }

        // --- Authorization Check ---
        // Fetch the folder to check ownership before deleting
        const { data: folderData, error: fetchError } = await supabase
            .from("storage_folders")
            .select("owner_id")
            .eq("id", folder_id)
            .maybeSingle(); // Use maybeSingle to handle not found gracefully

        if (fetchError) {
            console.error("Error fetching folder for ownership check (delete):", fetchError);
            return NextResponse.json<DeleteFolderResponseBody>({ error: "Failed to verify folder ownership before deletion" }, { status: 500 });
        }

        if (!folderData) {
            // If folder doesn't exist, it's effectively already deleted from the user's perspective.
            // Return success or 404? Let's return 404 for consistency.
            return NextResponse.json<DeleteFolderResponseBody>({ error: "Folder not found" }, { status: 404 });
        }

        // Check if the requesting user is the owner
        if (folderData.owner_id !== user_id) {
            return NextResponse.json<DeleteFolderResponseBody>({ error: "Forbidden: You do not have permission to delete this folder" }, { status: 403 });
        }
        // --- End Authorization Check ---


        // Perform the delete operation if authorized
        const { error } = await supabase
            .from("storage_folders")
            .delete()
            .eq("id", folder_id); // Ensure we only delete the specific folder

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