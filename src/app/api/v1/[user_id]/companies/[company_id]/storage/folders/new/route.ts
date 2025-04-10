import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string
    company_id: string
}

export interface CreateFolderRequestBody {
    folderName: string,
    folderColor?: string | null,
    parentFolderId?: string | null
}

export interface CreateFolderResponseBody {
    data?: {
        id: string
    },
    error?: string
}

export async function POST(request: Request, { params: {user_id, company_id} }: { params: params }) {
    try{
        const supabase = await getServerDBfromCompanyId(company_id);
        if(!supabase){
            return NextResponse.json({error: "Failed to connect to database"}, {status: 500})
        }

        const { folderName, folderColor, parentFolderId }: CreateFolderRequestBody = await request.json();

        const { data, error } = await supabase.from("storage_folders")
        .insert({
            name: folderName.trim(),
            color: folderColor || null,
            parent_id: parentFolderId || null,
            owner_id:user_id
        })
        .select("id")
        .single();

        if(error){
            console.log(error);
            return NextResponse.json({error: "Failed to create folder"}, {status: 500})
        }

        return NextResponse.json({data}, {status: 200})
    }
    catch (error){
        console.log(error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}