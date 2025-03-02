import { supabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string
}

export interface CompanyType {
    id: string,
    name: string,
    database:{
        id: string;
        name: string;
        created_at: string;
    } | null
    created_at: string,
}

export interface CompaniesListResponse {
    data?: CompanyType[]
    error?: string
}

export async function GET(req: Request, {params: {user_id}}: {params: Params}) {
    const {data, error} = await supabase.from("company")
    .select("id,name,created_at, database:data_bases(id,name,created_at)")
    .eq("user_id", user_id);

    if(error){
        console.log(error);
        return NextResponse.json({data:[], error: error.message});
    }

    return NextResponse.json({data});
}