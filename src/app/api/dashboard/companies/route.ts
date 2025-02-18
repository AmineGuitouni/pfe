import { supabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";


export async function GET() {

    const {data, error} = await supabase.from("company")
    .select("id,name,created_at")


    if(error){
        console.log(error);
        return NextResponse.json({data:[], error: error.message});
    }

    return NextResponse.json({data});
}

export async function POST(req:Request) {

    const {name, user_id}= await req.json();
    console.log(name,user_id);
    const {data, error} = await supabase.from("company")
    .insert({name, user_id })
    .select("id")
    .single()

    if(error){
        console.log(error);
        return NextResponse.json({data:[], error: error.message});      
    }

    return NextResponse.json({data});
}