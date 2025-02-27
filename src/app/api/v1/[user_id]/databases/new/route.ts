import { authedSupabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";

export type DatabasePostRequestBody = {
    name: string
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
      const {name, connection_config}:DatabasePostRequestBody = await req.json();
        
    if (
      !name ||
      !connection_config ||
      !connection_config.NEXT_PUBLIC_SUPABASE_URL ||
      !connection_config.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      !connection_config.SUPABASE_KEY ||
      !connection_config.SUPABASE_JWT_SECRET
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await authedSupabase(user_id)
      .from("data_bases")
      .insert({ name: name.trim(), user_id, connection_config })
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}