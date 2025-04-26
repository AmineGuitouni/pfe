import { getFileEmbedddings } from "@/lib/ai/embeddings/getEmbedddings";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names if needed

interface Params {
    user_id: string;
    company_id: string;
}

// Request body is FormData, not JSON for file uploads
// We expect 'file' and optionally 'parentFolderId' in the FormData

export interface CreateFileResponseBody {
    data?: {
        id: string;
        path: string;
    };
    error?: string;
}

export async function POST(request: Request, { params: { user_id, company_id } }: { params: Params }) {
    try {
        
        const supabase = await getServerDBfromCompanyId(company_id,user_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const parentFolderId = formData.get('parentFolderId') as string | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Generate a unique path for the file in storage
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        // Store files under company_id/user_id/ to keep things organized
        const storagePath = `${company_id}/${user_id}/${uniqueFileName}`;
        const bucketName = "storage"; // As requested

        // Upload file to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
            .from(bucketName)
            .upload(storagePath, file);

        if (storageError) {
            console.error("Supabase Storage Error:", storageError);
            // Attempt to remove the file if upload failed partially (though upload errors usually mean it didn't store)
            // await supabase.storage.from(bucketName).remove([storagePath]); // Optional: cleanup on error
            return NextResponse.json({ error: `Failed to upload file: ${storageError.message}` }, { status: 500 });
        }

         if (!storageData || !storageData.path) {
             console.error("Supabase Storage Error: No path returned after upload");
             // Attempt to remove the file if upload seemed successful but returned no path
             await supabase.storage.from(bucketName).remove([storagePath]);
             return NextResponse.json({ error: "Failed to upload file: Storage did not return a path." }, { status: 500 });
        }

        // Insert file metadata into the database
        const { data: dbData, error: dbError } = await supabase
            .from("storage_file")
            .insert({
                name: file.name,
                path: storageData.path, // Use the path returned by storage
                owner_id: user_id,
                size: file.size,
                type: file.type,
                folder_id: parentFolderId || null,
            })
            .select("id")
            .single();

        if (dbError) {
            console.error("Database Insert Error:", dbError);
            // If DB insert fails, remove the file from storage to avoid orphans
            await supabase.storage.from(bucketName).remove([storagePath]);
            return NextResponse.json({ error: `Failed to save file metadata: ${dbError.message}` }, { status: 500 });
        }

        try{
            const embeddings = await getFileEmbedddings(file);
            if(!embeddings){
                throw new Error("Failed to get embeddings");
            }

            const {error} = await supabase.from("storage_file_embedding")
            .insert(embeddings.map((embedding) => ({
                file_id: dbData.id,
                embedding: embedding
            })))

            if(error){
                console.error("Database Insert Error:", error);
            }
        }
        catch (error) {
            console.error("Cohere Error:", error);
        }

        return NextResponse.json({ data: { id: dbData.id, path: storageData.path } }, { status: 200 });

    } catch (error) {
        console.error("Internal Server Error:", error);
        // Consider more specific error handling/cleanup if possible
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}