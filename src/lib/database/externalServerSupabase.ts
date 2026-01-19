import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import jwt from "jsonwebtoken";

export async function getServerDBfromCompanyId( companyId: string , user_id?:string ) {
    
    const {data, error} = await supabase.from("company")
    .select("database:data_bases(connection_config), database_id")
    .eq("id", companyId)
    .single() as any

    if(error){
        return null;
    }

    const URL = data.database_id ? data.database.connection_config.NEXT_PUBLIC_SUPABASE_URL :
    process.env.NEXT_PUBLIC_SHARED_SUPABASE_URL

    const KEY = data.database_id ? (data.database.connection_config.SUPABASE_SERVICE_ROLE_KEY || data.database.connection_config.SUPABASE_KEY) :
    process.env.SHARED_SUPABASE_SERVICE_ROLE_KEY

    const JWT = data.database_id ? data.database.connection_config.SUPABASE_JWT_SECRET :
    process.env.SHARED_SUPABASE_JWT_SECRET;

    if(user_id && process.env.ENVIREMENT !== "dev"){

        const supabaseTokenPayload = {
            sub: user_id,
            ref: "tbnfcrturvesuzrlsldk",
            role: "service_role",
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 10),
            company_id: companyId,
        }

        const supabase_token = jwt.sign(supabaseTokenPayload, JWT)
        
        const client = createClient(URL, KEY,{
            global: {
                headers: {
                    Authorization: `Bearer ${supabase_token}`
                }
            }
        });

        return client

    }

    const client = createClient(URL, KEY);
    return client
}