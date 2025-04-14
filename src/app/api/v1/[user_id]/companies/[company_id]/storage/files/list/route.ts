import { getQueryEmbedddings } from "@/lib/ai/embeddings/getEmbedddings";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

// Define a type for the file items returned by the API
export interface FileItem {
    id: string; // Assuming id is string/uuid in Supabase mapping, adjust if bigint
    created_at: string;
    updated_at: string;
    name: string;
    path: string;
    owner_id: string | null;
    size: number;
    type: string;
    folder_id: string | null;
}


interface Params {
    user_id: string; // user_id is in the path but not directly used in this query logic
    company_id: string;
}

export interface ListFilesResponseBody {
    data?: FileItem[];
    error?: string;
}

export async function GET(req: Request, { params: { company_id } }: { params: Params }) {
    try {
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        const { searchParams } = new URL(req.url);
        const parentFolderId = searchParams.get("parent_id");
        const searchQuery = searchParams.get("query");

        console.log({
            parentFolderId,
            searchQuery
        })
        if(searchQuery){
            const queryEmbedding = await getQueryEmbedddings(searchQuery);
            if(!queryEmbedding){
                return NextResponse.json({ error: "Failed to get query embeddings" }, { status: 500 });
            }

            const {data, error} = await supabase.rpc("search_documents_content",{
                query_embedding: queryEmbedding,
                match_threshold: 0.5,
                match_count: 100
            })

            if(error){
                console.error("Database Fetch Error:", error);
                return NextResponse.json({ error: "Failed to fetch files with search query: " + searchQuery }, { status: 500 });
            }
            
            const filesData: FileItem[] = data || [];
            console.log({
                queryEmbedding,
                filesData
            })
            return NextResponse.json({ data: filesData }, { status: 200 });
        }

        const query = supabase.from("storage_file")
            .select("id, name, path, owner_id, size, type, folder_id, created_at, updated_at")
            .order("updated_at", { ascending: false });

        // Filter based on the parent folder ID
        if (parentFolderId && parentFolderId !== "null") {
            query.eq("folder_id", parentFolderId);
        } else {
            // If no parent_id or 'null' is passed, fetch files in the root (folder_id is null)
            query.is("folder_id", null);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Database Fetch Error:", error);
            return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
        }

        // Ensure data conforms to FileItem[] type if needed, though Supabase types might align
        const filesData: FileItem[] = data || [];

        return NextResponse.json({ data: filesData }, { status: 200 });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}