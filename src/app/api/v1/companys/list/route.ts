import { supabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";

export async function GET(req:Request) {
    const {searchParams} = new URL(req.url)
    const filter = searchParams.get("filter") || "";
    const limit = Number(searchParams.get("limit") || "10");

    const {data, error} = await supabase.from("company")
    .select("*")
    .limit(limit)
    .order("name")
    .ilike("name", `%${filter}%`);

    if(error){
        console.log(error);
        return NextResponse.json({data:[], error: error.message});
    }

    return NextResponse.json({data});
}