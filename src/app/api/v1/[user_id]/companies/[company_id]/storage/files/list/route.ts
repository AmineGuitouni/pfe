import { getQueryEmbedddings } from "@/lib/ai/embeddings/getEmbedddings";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

// Define a type for the file items returned by the API
export interface FileItem {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    path: string;
    owner_id: string | null;
    size: number;
    type: string;
    folder_id: string | null;
    isShared: boolean; // Added isShared field
}


interface Params {
    user_id: string;
    company_id: string;
}

export interface ListFilesResponseBody {
    data?: FileItem[];
    error?: string;
}

export async function GET(req: Request, { params: { company_id, user_id } }: { params: Params }) {
    try {
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        const { searchParams } = new URL(req.url);
        const parentFolderId = searchParams.get("parent_id");
        const searchQuery = searchParams.get("query");
        const userRole = req.headers.get("X-user-role");

        // --- Search Query Handling (Remains the same, isShared might need adding in the RPC function itself) ---
        if(searchQuery){
            const queryEmbedding = await getQueryEmbedddings(searchQuery);
            if(!queryEmbedding){
                return NextResponse.json({ error: "Failed to get query embeddings" }, { status: 500 });
            }

            // NOTE: The search_documents_content RPC function would also need modification
            // to return an 'isShared' equivalent based on its internal logic if consistency is needed during search.
            // This current change only affects the direct listing.
            const {data, error} = await supabase.rpc("search_documents_content",{
                query_embedding: queryEmbedding,
                user_id: userRole === "owner" ? null : user_id,
                match_threshold: 0.5,
                match_count: 100
            })

            if(error){
                console.error("Database Fetch Error:", error);
                return NextResponse.json({ error: "Failed to fetch files with search query: " + searchQuery }, { status: 500 });
            }

            // Assuming RPC returns raw data, add isShared: false for now for search results
            // A more robust solution involves modifying the RPC function.
            const filesData: FileItem[] = (data || []).map((file: any) => ({ // Added : any type annotation
                ...file,
                isShared: userRole !== 'owner' && file.owner_id !== user_id // Basic check, might be inaccurate if RPC logic differs
            }));

            console.log({
                queryEmbedding,
                filesData
            })
            return NextResponse.json({ data: filesData }, { status: 200 });
        }

        // --- Direct Listing Logic (Modified for isShared) ---
        let finalFilesData: FileItem[] = [];
        let fetchError: any = null;

        const baseSelect = "id, name, path, owner_id, size, type, folder_id, created_at, updated_at";
        const baseOrder = { column: "updated_at", ascending: false };

        if (userRole === "owner") {
            // Owner sees all files, filtered by parentFolderId
            const query = supabase.from("storage_file")
                .select(baseSelect)
                .order(baseOrder.column, { ascending: baseOrder.ascending });

            // Apply folder filter for owner
            if (parentFolderId && parentFolderId !== "null") {
                query.eq("folder_id", parentFolderId);
            } else {
                query.is("folder_id", null);
            }

            const { data, error } = await query;
            // Add isShared: false for owner
            finalFilesData = (data || []).map(file => ({ ...file, isShared: false }));
            fetchError = error;

        } else {
            // Non-owner: Fetch owned files (respecting folder filter) + shared files (ignoring folder filter)

            // 1. Fetch accessible file IDs
            const { data: accessData, error: accessError } = await supabase
                .from("storage_file_user_access")
                .select("file_id")
                .eq("user_id", user_id);

            if (accessError) {
                console.error("Database Fetch Error (Access Table):", accessError);
                return NextResponse.json({ error: "Failed to fetch file access permissions" }, { status: 500 });
            }
            const accessibleFileIds = accessData?.map(item => item.file_id) || [];

            // 2. Fetch owned files matching the folder filter
            const ownedQuery = supabase.from("storage_file")
                .select(baseSelect)
                .eq("owner_id", user_id)
                .order(baseOrder.column, { ascending: baseOrder.ascending });

            if (parentFolderId && parentFolderId !== "null") {
                ownedQuery.eq("folder_id", parentFolderId);
            } else {
                ownedQuery.is("folder_id", null);
            }
            const { data: ownedDataRaw, error: ownedError } = await ownedQuery;

            if (ownedError) {
                 console.error("Database Fetch Error (Owned Files):", ownedError);
                 return NextResponse.json({ error: "Failed to fetch owned files" }, { status: 500 });
            }
            // Add isShared: false to owned files
            const ownedData = (ownedDataRaw || []).map(file => ({ ...file, isShared: false }));


            // 3. Fetch shared files (ignoring folder filter)
            let sharedData: FileItem[] = [];
            if (accessibleFileIds.length > 0) {
                const { data: sharedResultRaw, error: sharedError } = await supabase
                    .from("storage_file")
                    .select(baseSelect)
                    .in("id", accessibleFileIds)
                    // Exclude files the user owns from the shared list explicitly
                    .not("owner_id", "eq", user_id)
                    .order(baseOrder.column, { ascending: baseOrder.ascending });

                if (sharedError) {
                    console.error("Database Fetch Error (Shared Files):", sharedError);
                    return NextResponse.json({ error: "Failed to fetch shared files" }, { status: 500 });
                }
                 // Add isShared: true to shared files
                sharedData = (sharedResultRaw || []).map(file => ({ ...file, isShared: true }));
            }

            // 4. Combine owned and shared files (already distinct due to query in step 3)
            finalFilesData = [...ownedData, ...sharedData];

            // Sort the final combined list by updated_at
            finalFilesData.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        }

        // Handle potential fetch error from the owner's query path
        if (fetchError) {
            console.error("Database Fetch Error (Owner Path):", fetchError);
            return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
        }

        return NextResponse.json({ data: finalFilesData }, { status: 200 });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}