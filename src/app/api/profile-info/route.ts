import { authOptions } from "@/lib/auth/authOptions";
import { supabase } from "@/lib/database/supabase";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export type ProfileInfoPostRequestBody = {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    country?: string;
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if(!session || !session.user){
        return NextResponse.json({error:"Not logged in"}, {status:401});
    }

    try{
        const {country, firstName, lastName, phoneNumber}:ProfileInfoPostRequestBody = await req.json();
        const {error} = await supabase.from("users")
        .update({
            first_name: firstName,
            last_name: lastName,
            country: country,
            phone_number: phoneNumber
        })
        .eq("id", session.user.id)

        if(error){
            console.log(error)
            return NextResponse.json({error:error.message}, {status: 501})
        }

        return NextResponse.json({ok:true}, {status:200})
    }
    catch(error){
        console.log(error)
        return NextResponse.json({error:error}, {status: 500})
    }
}