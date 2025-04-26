import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { supabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string
}

export interface CompanyType {
    id: string,
    name: string,
    description?: string; // Add optional description field
    database:{
        id: string;
        name: string;
        created_at: string;
    } | null
    logo?: string; 
    industry?: string; 
    created_at: string,
    workers: number
}

export interface CompaniesListResponse {
    data?: CompanyType[]
    error?: string
}

export async function GET(req: Request, {params: {user_id}}: {params: Params}) {
    const {data, error} = await supabase.from("company")
    .select("id,name,created_at, database:data_bases(id,name,created_at),logo,industry,description")
    .eq("user_id", user_id);

    if(error){
        console.log(error);
        return NextResponse.json({data:[], error: error.message});
    }

    const companies = await Promise.all(data.map(async (company) => {
        const loaclSupabase = await getServerDBfromCompanyId(company.id)
        if(!loaclSupabase){
            return {
                ...company,
                workers: 0
            }
        }
        const {count, error: workersError} = await loaclSupabase.from("users")
        .select("", {count: "exact"})
        .eq("company_id", company.id)

        if(workersError){
            return {
                ...company,
                workers: 0
            }
        }

        return {
            ...company,
            workers:count
        }
    }))

    return NextResponse.json({data: companies});
}