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

    const KEY = data.database_id ? data.database.connection_config.SUPABASE_KEY :
    process.env.SHARED_SUPABASE_KEY

    if(user_id){

        const supabaseTokenPayload = {
            sub: user_id,
            ref: "tbnfcrturvesuzrlsldk",
            role: "service_role",
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 10),
            company_id: companyId,
        }

        const supabase_token = jwt.sign(supabaseTokenPayload, data.database.connection_config.SUPABASE_JWT_SECRET!)
        
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