import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import jwt from "jsonwebtoken";

export async function getServerDBfromCompanyId( companyId: string , user_id?:string ) {
    
    const {data, error} = await supabase.from("company")
    .select("database:data_bases(connection_config)")
    .eq("id", companyId)
    .single() as any

    if(error){
        return null;
    }

    if(user_id){

        const supabaseTokenPayload = {
            sub: user_id,
            ref: "tbnfcrturvesuzrlsldk",
            role: "service_role",
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 10),
            company_id: companyId,
        }

        const supabase_token = jwt.sign(supabaseTokenPayload, data.database.connection_config.SUPABASE_JWT_SECRET!)
        
        const client = createClient(data.database.connection_config.NEXT_PUBLIC_SUPABASE_URL, data.database.connection_config.SUPABASE_KEY,{
            global: {
                headers: {
                    Authorization: `Bearer ${supabase_token}`
                }
            }
        });

        return client

    }

    const client = createClient(data.database.connection_config.NEXT_PUBLIC_SUPABASE_URL, data.database.connection_config.SUPABASE_KEY);

    return client

}