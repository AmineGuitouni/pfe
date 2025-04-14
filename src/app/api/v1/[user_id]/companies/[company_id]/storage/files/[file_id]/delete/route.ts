import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string; // Not directly used but part of the route
    company_id: string;
    file_id: string;
}

export interface DeleteFileResponseBody {
    message?: string;
    error?: string;
}

export async function DELETE(req: Request, { params: { company_id, file_id } }: { params: Params }) {
    try {
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json<DeleteFileResponseBody>({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Check if file_id is provided
        if (!file_id) {
            return NextResponse.json<DeleteFileResponseBody>({ error: "File ID is required" }, { status: 400 });
        }

        const bucketName = "storage";

        // 1. Fetch the file record to get the storage path
        const { data: fileData, error: fetchError } = await supabase
            .from("storage_file")
            .select("path")
            .eq("id", file_id)
            .single();

        if (fetchError) {
            console.error("Error fetching file record:", fetchError);
            if (fetchError.code === 'PGRST116' || (fetchError.details && fetchError.details.includes('0 rows'))) {
                 // If the record doesn't exist, maybe it was already deleted. Return success or specific message.
                 // Or return 404 if we want to be strict. Let's return 404.
                 return NextResponse.json<DeleteFileResponseBody>({ error: "File not found" }, { status: 404 });
            }
            return NextResponse.json<DeleteFileResponseBody>({ error: "Failed to fetch file details for deletion" }, { status: 500 });
        }

        if (!fileData || !fileData.path) {
             // This case should ideally not happen if fetchError is null, but good to check.
             console.error("File record found but path is missing for file_id:", file_id);
             return NextResponse.json<DeleteFileResponseBody>({ error: "File record is incomplete, cannot delete from storage" }, { status: 500 });
        }

        const storagePath = fileData.path;

        // 2. Delete the file from Supabase Storage
        const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([storagePath]);

        if (storageError) {
            // Log the error but proceed to delete the DB record anyway?
            // Or stop here? Let's stop here to indicate storage deletion failed.
            // The client might retry, or manual cleanup might be needed.
            console.error(`Error deleting file from storage (${bucketName}/${storagePath}):`, storageError);
            return NextResponse.json<DeleteFileResponseBody>({ error: `Failed to delete file from storage: ${storageError.message}` }, { status: 500 });
        }

        // 3. Delete the file record from the database
        const { error: dbError } = await supabase
            .from("storage_file")
            .delete()
            .eq("id", file_id);

        if (dbError) {
            // This is problematic: file deleted from storage, but DB record remains.
            // Log this critical state. Manual cleanup might be needed.
            console.error(`CRITICAL: File deleted from storage (${bucketName}/${storagePath}) but failed to delete DB record (ID: ${file_id}):`, dbError);
            return NextResponse.json<DeleteFileResponseBody>({ error: "File deleted from storage, but failed to delete database record. Please check system integrity." }, { status: 500 });
        }

        return NextResponse.json<DeleteFileResponseBody>({ message: "File deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json<DeleteFileResponseBody>({ error: "Internal Server Error" }, { status: 500 });
    }
}