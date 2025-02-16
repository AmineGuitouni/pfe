import { supabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";

export type Database = {
    id: string;
    name: string;
    type: string;
    created_at: string;
    rigion?: string | null;
    connection_config: {
        SUPABASE_KEY: string;
        SUPABASE_JWT_SECRET: string;
        NEXT_PUBLIC_SUPABASE_URL: string;
        NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    };
}

export type DatabaseApiResponseBody = {
    data?: Database[];
    error?: string;
}

export async function GET(req: Request, {params: {user_id}}: {params: {user_id: string}}) {
    try {
        const {data, error} = await supabase.from("data_bases")
        .select("id, name, type, created_at, connection_config, rigion")
        .eq("user_id", user_id);

        if (error) {
            console.log(error);
            return NextResponse.json({error: error.message}, {status: 500});
        }

        return NextResponse.json({data});
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}