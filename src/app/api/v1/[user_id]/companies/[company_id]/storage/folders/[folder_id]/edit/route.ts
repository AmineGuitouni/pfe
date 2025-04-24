import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string;
    company_id: string;
    folder_id: string;
}

interface EditFolderRequestBody {
    name?: string;
    color?: string | null;
}

export interface EditFolderResponseBody {
    message?: string;
    error?: string;
}

export async function PATCH(req: Request, { params: { company_id, folder_id ,user_id } }: { params: params }) {
    try {
        const supabase = await getServerDBfromCompanyId(company_id,user_id);
        if (!supabase) {
            return NextResponse.json<EditFolderResponseBody>({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Check if folder_id is provided
        if (!folder_id) {
            return NextResponse.json<EditFolderResponseBody>({ error: "Folder ID is required" }, { status: 400 });
        }

        // Parse the request body
        let body: EditFolderRequestBody;
        try {
            body = await req.json();
        } catch (parseError) {
            console.log({parseError})
            return NextResponse.json<EditFolderResponseBody>({ error: "Invalid request body" }, { status: 400 });
        }

        const { name, color } = body;

        // Construct the update object
        const updateData: { name?: string; color?: string | null, updated_at: string } = { updated_at: new Date().toISOString() };
        let hasUpdate = false;

        if (name !== undefined) {
            updateData.name = name;
            hasUpdate = true;
        }

        // Only update color if it's explicitly provided in the body
        if (color !== undefined) {
             updateData.color = color; // This handles both a string value and null
             hasUpdate = true;
        } else {
            // If color is not in the body, we don't update it (keeps existing value)
            // If the user *wants* to set it to null explicitly, they must send "color": null
        }


        // If neither name nor color is provided, nothing to update
        if (!hasUpdate) {
             return NextResponse.json<EditFolderResponseBody>({ message: "No update data provided" }, { status: 200 }); // Or potentially 400 Bad Request
        }


        // Perform the update operation
        const { error } = await supabase
            .from("storage_folders")
            .update(updateData)
            .eq("id", folder_id)
            
        if (error) {
            console.error("Error updating folder:", error);
             // Handle potential errors like folder not found (e.g., error.code === 'PGRST116' if using PostgREST directly, check Supabase specific errors)
            if (error.code === 'PGRST116' || (error.details && error.details.includes('0 rows'))) { // Check if folder exists
                 return NextResponse.json<EditFolderResponseBody>({ error: "Folder not found" }, { status: 404 });
            }
            return NextResponse.json<EditFolderResponseBody>({ error: "Failed to update folder" }, { status: 500 });
        }

        return NextResponse.json<EditFolderResponseBody>({ message: "Folder updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Internal Server Error:", error);
        if (error instanceof SyntaxError) {
             return NextResponse.json<EditFolderResponseBody>({ error: "Invalid JSON format in request body" }, { status: 400 });
        }
        return NextResponse.json<EditFolderResponseBody>({ error: "Internal Server Error" }, { status: 500 });
    }
}