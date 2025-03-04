import { authedSupabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";

interface Params{user_id: string, company_id: string}
export interface CompanyPostRequestBody{name: string, database_id: string}
export interface CompanyPostResponseBody{
    error?: string
    ok?: boolean
}
export async function PUT(req: Request, {params: {user_id, company_id}}: {params: Params}){
    const {name, database_id}= await req.json();

    const {error} = await authedSupabase(user_id).from("company")
    .update({name, database_id})
    .eq("id", company_id)
    .eq("user_id", user_id)

    if(error){
        console.log(error);
        return NextResponse.json({ok:false, error: error.message});      
    }

    return NextResponse.json({ok:true});
}