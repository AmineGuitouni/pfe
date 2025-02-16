import { supabase } from "@/lib/database/supabase"
import { NextResponse } from "next/server"

export type DatabasePostRequestBody = {
    name: string
    type: string
    rigion?: string
    connection_config: {
        SUPABASE_KEY: string;
        SUPABASE_JWT_SECRET: string;
        NEXT_PUBLIC_SUPABASE_URL: string;
        NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    };
}

export type DatabasePostResponseBody = {
    data?: {
        id:string
    },
    error?: string
}

export async function POST(req:Request, {params:{user_id}}: {params:{user_id: string}}) {

    try{
        const {name, type, rigion, connection_config}:DatabasePostRequestBody = await req.json();
        
        if(!name || !type || !connection_config || !connection_config.NEXT_PUBLIC_SUPABASE_URL || !connection_config.NEXT_PUBLIC_SUPABASE_ANON_KEY || !connection_config.SUPABASE_KEY || !connection_config.SUPABASE_JWT_SECRET) {
            return NextResponse.json({error:"Missing required fields"}, {status: 400})
        }

        const {data, error} = await supabase.from("data_bases")
        .insert({name, type, user_id, rigion, connection_config})
        .select("id")
        .single()

        if(error) {
            console.log(error)
            return NextResponse.json({error:"Internal Server Error"}, {status: 500})
        }

        return NextResponse.json({data})
    }
    catch(error){
        console.log(error)
        return NextResponse.json({error:"Internal Server Error"}, {status: 500})
    }
}