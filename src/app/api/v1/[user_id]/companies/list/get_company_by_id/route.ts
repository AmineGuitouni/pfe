import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { supabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";


export async function GET(req: Request, {params: {user_id}}: {params: {user_id: string}}) {
    try {

        const {searchParams} = new URL(req.url);
        const company_id = searchParams.get("company_id");

        if (!company_id) {
            return NextResponse.json({error: "company_id is required"}, {status: 400});
        }
        if (!user_id) {
            return NextResponse.json({error: "user_id is required"}, {status: 400});
        }

        console.log("Fetching company with ID:", company_id, "for user:", user_id);

        const {data, error} = await supabase.from("company")
        .select("id,name,created_at, database:data_bases(id,name,created_at),logo,industry,description")
        .eq("id", company_id)
        .single();

        if (error) {
            console.log(error);
            return NextResponse.json({error: error.message}, {status: 500});
        }

        console.log("Fetched company half data:", data);

        let countWorkers = 0;

        const loaclSupabase = await getServerDBfromCompanyId(company_id)
        if(loaclSupabase){
            console.log("Fetching workers count from local database for company ID:", company_id);
            const {count} = await loaclSupabase.from("users")
            .select("", {count: "exact"})
            .eq("company_id", company_id)

            countWorkers = count || 0;

        }

        const newData = {
            ...data,
            workers: countWorkers
        }

        return NextResponse.json({data:newData}, {status: 200});
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}