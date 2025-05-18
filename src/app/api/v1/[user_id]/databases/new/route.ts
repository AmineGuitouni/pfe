import { applySchema } from "@/lib/database/migration/applySchemaToNewDb";
import { dumpDatabaseSchemaPureNode } from "@/lib/database/migration/dumpSharedDb";
import { authedSupabase } from "@/lib/database/supabase";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export type DatabasePostRequestBody = {
    name: string
    connection_config: {
        SUPABASE_KEY: string;
        SUPABASE_JWT_SECRET: string;
        NEXT_PUBLIC_SUPABASE_URL: string;
        NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
        CONNECTION_STRING: string;
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
      !connection_config.SUPABASE_JWT_SECRET ||
      !connection_config.CONNECTION_STRING
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const baseReferenceClient = createClient(
      process.env.NEXT_PUBLIC_SHARED_SUPABASE_URL!,
      process.env.SHARED_SUPABASE_KEY!,
    )

    // Prepare the Database
    const newDbClient = createClient(
      connection_config.NEXT_PUBLIC_SUPABASE_URL,
      connection_config.SUPABASE_KEY,
    )

    // Add the buckets to supabase Storage
    const { data: baseBuckets, error: baseBucketsError } = await baseReferenceClient
    .storage
    .listBuckets()

    if (baseBucketsError) {
      console.error("Error listing buckets:", baseBucketsError);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    if (baseBuckets) {
      for (const bucket of baseBuckets) {
        const { error: newBucketError } = await newDbClient
          .storage
          .createBucket(bucket.name, { public: bucket.public });

        if (newBucketError) {
          console.error("Error creating bucket:", newBucketError);
          return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
      }
    }

    // Add Schema
    const baseSchema = await dumpDatabaseSchemaPureNode(
      process.env.SHARED_CONNECTION_STRING!,
    )

    await applySchema(
      connection_config.CONNECTION_STRING,
      baseSchema,
    )


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
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}