import { supabase } from "../database/supabase"
import { getServerDBfromCompanyId } from "../database/externalServerSupabase";

export async function getUser(credentials:{
    company?: string,
    email?: string
}){
    if(credentials?.company){

        const localSupabase = await getServerDBfromCompanyId(credentials.company);

        if(!localSupabase){
            throw new Error("Failed to connect to database")
        }

        const {data, error} = await localSupabase
        .from("users")
        .select("*")
        .eq('company_id', credentials.company)
        .eq("email", credentials.email)
        .single()

        console.log({data})

        if(error){
            console.log(error)
            throw new Error(error.message)
        }

        const {data:cvData, error:cvError} = await localSupabase
        .from("cv_informations")
        .select("user_id")
        .eq("user_id", data.id)
        

        if(cvError){
            console.log(cvError)
            throw new Error(cvError.message)
        }


        return {
            ...data, role : "worker",email_verified : true, cv_informations : cvData.length > 0 ? true : false
        }
    }
    else{
        const { data , error} = await supabase.from("users")
        .select("*")
        .eq("email", credentials.email?.trim().toLowerCase())
        .single() 

        if(error){
            console.log(error)
            throw new Error(error.message)
        }

        return data
    }
}