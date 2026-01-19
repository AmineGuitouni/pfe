import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string; // May be used for authorization checks later if needed
    company_id: string;
    file_id: string;
}

export interface GetSignedUrlResponseBody {
    data?: {
        signedUrl: string;
    };
    error?: string;
}

const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

export async function GET(req: Request, { params: { company_id, file_id } }: { params: Params }) {
    try {
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json<GetSignedUrlResponseBody>({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Check if file_id is provided
        if (!file_id) {
            return NextResponse.json<GetSignedUrlResponseBody>({ error: "File ID is required" }, { status: 400 });
        }

        const bucketName = process.env.SUPABASE_PRIVATE_BUCKET || 'private-bucket';

        // 1. Fetch the file record to get the storage path
        const { data: fileData, error: fetchError } = await supabase
            .from("storage_file")
            .select("path") // Select only the path
            .eq("id", file_id)
            // Optional: Add owner_id check for authorization if needed
            // .eq("owner_id", user_id)
            .single();

        if (fetchError) {
            console.error("Error fetching file record for signed URL:", fetchError);
            if (fetchError.code === 'PGRST116' || (fetchError.details && fetchError.details.includes('0 rows'))) {
                 return NextResponse.json<GetSignedUrlResponseBody>({ error: "File not found" }, { status: 404 });
            }
            return NextResponse.json<GetSignedUrlResponseBody>({ error: "Failed to fetch file details" }, { status: 500 });
        }

        if (!fileData || !fileData.path) {
             console.error("File record found but path is missing for file_id:", file_id);
             return NextResponse.json<GetSignedUrlResponseBody>({ error: "File record is incomplete" }, { status: 500 });
        }

        const storagePath = fileData.path;

        // 2. Determine expiry duration from search params or use default
        const { searchParams } = new URL(req.url);
        const expiresInParam = searchParams.get('expires_in');
        let expiryDuration = SIGNED_URL_EXPIRY_SECONDS; // Default

        if (expiresInParam) {
            const parsedExpiry = parseInt(expiresInParam, 10);
            // Use custom expiry only if it's a valid positive number
            if (!isNaN(parsedExpiry) && parsedExpiry > 0) {
                expiryDuration = parsedExpiry;
                // Optional: Add logging for debugging
                // console.log(`Using custom expiry duration: ${expiryDuration} seconds for file ${file_id}`);
            } else {
                // Optional: Log a warning if the parameter is invalid
                // console.warn(`Invalid 'expiresIn' parameter: '${expiresInParam}'. Using default expiry: ${expiryDuration} seconds.`);
            }
        }

        // 3. Generate the signed URL using the determined expiry duration
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(storagePath, expiryDuration); // Use determined expiryDuration

        if (signedUrlError) {
            console.error(`Error generating signed URL for ${bucketName}/${storagePath}:`, signedUrlError);
            return NextResponse.json<GetSignedUrlResponseBody>({ error: `Failed to generate download link: ${signedUrlError.message}` }, { status: 500 });
        }

        if (!signedUrlData || !signedUrlData.signedUrl) {
             console.error(`Signed URL generation returned no URL for ${bucketName}/${storagePath}`);
             return NextResponse.json<GetSignedUrlResponseBody>({ error: "Failed to generate download link" }, { status: 500 });
        }

        // 4. Return the signed URL
        return NextResponse.json<GetSignedUrlResponseBody>({ data: { signedUrl: signedUrlData.signedUrl } }, { status: 200 });

    } catch (error) {
        console.error("Internal Server Error in get-link:", error);
        return NextResponse.json<GetSignedUrlResponseBody>({ error: "Internal Server Error" }, { status: 500 });
    }
}