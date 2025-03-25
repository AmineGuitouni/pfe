import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string;
    company_id: string;
    project_id: string;
}

export async function GET(req: Request, {params: {company_id}}: {params: params}){
    try{
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        const {data: availbleUsers, error: usersError} = await supabase.from("users")
        .select("cv:cv_informations(*)")
        .eq("company_id", company_id)

        if(usersError){
            console.log(usersError);
            return NextResponse.json({error: "Failed to get users"}, {status: 500})
        }

        console.log(availbleUsers);

        return NextResponse.json({})
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error: "Something went wrong"}, {status: 500})
    }
}