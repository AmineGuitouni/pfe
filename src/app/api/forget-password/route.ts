import { supabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { resend } from "@/lib/resend";
import { ForgotPasswordTemplate } from "@/lib/emailtemplets/forget-password";

export async function GET(req: Request) {

    try{
        const url = new URL(req.url);
        const {searchParams} = url
        const email = searchParams.get("email");
        
        if(!email){
            return NextResponse.json({error: "Email is required"}, {status: 400});
        }

        const {data,error} = await supabase.from("users")
        .select("id")
        .eq("email", email)
        .single()

        if(error){
            console.log(error);
            return NextResponse.json({ok: true}, {status: 200});
        }

        if(!data || !data.id){
            return NextResponse.json({ok: true}, {status: 200});
        }

        const payload = {
            id : data.id,
            exp : Math.floor(Date.now() / 1000) + (60 * 20 ), 
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!);
        const link = `${url.origin}/reset-password?token=${token}`

        const {error: mailError} = await resend.emails.send({
            from: "noReply@guitouni-studio.online",
            to: [email],
            subject: "Reset Password",
            html: ForgotPasswordTemplate(link),
        });

        if(mailError){
            console.log(mailError);
            return NextResponse.json({error: "Unable to send email, try again later"}, {status: 500});
        }
        

        return NextResponse.json({ok : true}, {status: 200});
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }

}