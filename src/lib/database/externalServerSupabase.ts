import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function getServerDBfromCompanyId(companyId: string) {
    const {data, error} = await supabase.from("company")
    .select("database:data_bases(connection_config)")
    .eq("id", companyId)
    .single() as any

    if(error){
        console.log(error);
        return null;
    }

    const client = createClient(data.database.connection_config.NEXT_PUBLIC_SUPABASE_URL, data.database.connection_config.SUPABASE_KEY);

    return client
}