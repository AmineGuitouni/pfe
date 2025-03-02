import { authedSupabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string
}

export async function POST(req:Request, {params:{user_id}}: {params:Params}) {

    const {name}= await req.json();

    const {data, error} = await authedSupabase(user_id).from("company")
    .insert({name, user_id })
    .select("id")
    .single()

    if(error){
        console.log(error);
        return NextResponse.json({data:[], error: error.message});      
    }

    return NextResponse.json({data});
}