import { supabase } from "@/lib/database/supabase";
import { createClient } from '@supabase/supabase-js'

export default async function WorkspacePage({ params: { company } }: { params: { company: string } }) {
    const {data, error} = await supabase.from("keys").select("keys").eq("company", company).single();
    if(error) {
        console.log(error)
    }
    console.log(data)
    const localsb = createClient(data!.keys.NEXT_PUBLIC_SUPABASE_URL, data!.keys.SUPABASE_KEY);
    const { data: localData, error: localError } = await localsb.from("data").select("*");

    if (localError) {
        console.log(localError);
    }

    console.log(localData);
    return (
        <div>
            <h1>Workspace for {company} {localData ? localData[0].id : ""}</h1>
        </div>
    )
}