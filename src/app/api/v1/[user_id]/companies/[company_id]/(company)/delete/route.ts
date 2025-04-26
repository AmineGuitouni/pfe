import { redis } from "@/lib/database/redis";
import { authedSupabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string
}

export interface CompanyPostResponseBody {
    error?: string;
    ok?: boolean
}

export async function DELETE(req: Request, {params: {user_id, company_id}}: {params: Params}) {

    const {error} = await authedSupabase(user_id).from("company")
    .delete()
    .eq("id", company_id)
    .eq("user_id", user_id)

    redis.del(`user:${user_id}-company:${company_id}`)

    if(error){
        console.log(error);
        return NextResponse.json({ok:false, error: error.message});      
    }

    return NextResponse.json({ok:true});
}