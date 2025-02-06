import { createClient } from "@supabase/supabase-js"
import { supabase } from "../database/supabase"

export async function getUser(credentials:{
    company?: string,
    email?: string
}){
    if(credentials?.company){
        console.log(credentials.company)
        const {data, error} = await supabase.from("company")
        .select("user:users(key:keys(value))")
        .eq('id', credentials.company)
        .single()

        if(error){
            console.log(error)
            throw new Error(error.message)
        }

        const companyUser = data.user as any
        const keys = companyUser.key[0].value as any
        
        const localsb = createClient(keys.NEXT_PUBLIC_SUPABASE_URL,keys.SUPABASE_KEY);
        const { data: localData, error: localError } = await localsb.from("users")
        .select("*")
        .eq("email", credentials.email)
        .single()

        if(localError){
            console.log(localError)
            throw new Error(localError.message)
        }

        return localData
    }
    else{
        const { data , error} = await supabase.from("users")
        .select("*")
        .eq("email", credentials.email)
        .single() 

        if(error){
            console.log(error)
            throw new Error(error.message)
        }

        return data
    }
}