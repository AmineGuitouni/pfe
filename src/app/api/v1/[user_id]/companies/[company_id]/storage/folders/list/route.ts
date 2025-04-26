import { FolderItem } from "@/components/dashboard/files/types/filesTypes";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string
    company_id: string
}

export interface ListFoldersResponseBody {
    data?: FolderItem[]
    error?: string
}

export async function GET(req: Request, {params: {company_id, user_id}}: {params: params}) { // Added user_id
    try{
        const supabase = await getServerDBfromCompanyId(company_id);
        if(!supabase){
            return NextResponse.json({error: "Failed to connect to database"}, {status: 500})
        }

        const {searchParams} = new URL(req.url);
        const parent_id = searchParams.get("parent_id");

        const quary = supabase.from("storage_folders")
        .select("id, name, parent_id, created_at, updated_at, owner_id")
        .eq("owner_id", user_id) // Filter by owner
        .order("updated_at", { ascending: false });

        if (parent_id && parent_id !== "null") {
            quary.eq("parent_id", parent_id);
        } else {
            quary.is("parent_id", null);
        }

        const {data, error} = await quary;

        if(error){
            console.log(error);
            return NextResponse.json({error: "Failed to fetch folders"}, {status: 500})
        }

        return NextResponse.json({data}, {status: 200})
    }
    catch (error){
        console.log(error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}