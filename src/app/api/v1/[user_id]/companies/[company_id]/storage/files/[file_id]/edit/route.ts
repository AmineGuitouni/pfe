import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string; // Not directly used in update logic but part of the route structure
    company_id: string;
    file_id: string; // Changed from folder_id
}

interface EditFileRequestBody {
    name?: string; // Only allow editing the name for now
    // folder_id?: string | null; // Could add moving functionality later if needed
}

export interface EditFileResponseBody {
    message?: string;
    error?: string;
}

export async function PATCH(req: Request, { params: { company_id, file_id ,user_id} }: { params: Params }) {
    try {
        const supabase = await getServerDBfromCompanyId(company_id,user_id);
        if (!supabase) {
            return NextResponse.json<EditFileResponseBody>({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Check if file_id is provided
        if (!file_id) {
            return NextResponse.json<EditFileResponseBody>({ error: "File ID is required" }, { status: 400 });
        }

        // Parse the request body
        let body: EditFileRequestBody;
        try {
            body = await req.json();
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            return NextResponse.json<EditFileResponseBody>({ error: "Invalid request body" }, { status: 400 });
        }

        const { name } = body;

        // Construct the update object
        const updateData: { name?: string; updated_at: string } = { updated_at: new Date().toISOString() };
        let hasUpdate = false;

        if (name !== undefined && typeof name === 'string' && name.trim().length > 0) {
            updateData.name = name.trim();
            hasUpdate = true;
        } else if (name !== undefined) {
             // Handle cases where name is provided but invalid (e.g., empty string)
             return NextResponse.json<EditFileResponseBody>({ error: "Invalid file name provided" }, { status: 400 });
        }


        // If no valid update data is provided
        if (!hasUpdate) {
             return NextResponse.json<EditFileResponseBody>({ message: "No valid update data provided" }, { status: 400 });
        }


        // Perform the update operation on storage_file table
        const { error } = await supabase
            .from("storage_file") // Target the file table
            .update(updateData)
            .eq("id", file_id); // Use file_id

        if (error) {
            console.error("Error updating file:", error);
             // Handle potential errors like file not found
            if (error.code === 'PGRST116' || (error.details && error.details.includes('0 rows'))) { // Check if file exists
                 return NextResponse.json<EditFileResponseBody>({ error: "File not found" }, { status: 404 });
            }
            return NextResponse.json<EditFileResponseBody>({ error: "Failed to update file" }, { status: 500 });
        }

        return NextResponse.json<EditFileResponseBody>({ message: "File updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Internal Server Error:", error);
        if (error instanceof SyntaxError) {
             return NextResponse.json<EditFileResponseBody>({ error: "Invalid JSON format in request body" }, { status: 400 });
        }
        return NextResponse.json<EditFileResponseBody>({ error: "Internal Server Error" }, { status: 500 });
    }
}