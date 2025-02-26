import { authOptions } from "@/lib/auth/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { resend } from "@/lib/resend";
import { EmailChangeTemplate } from "@/lib/emailtemplets/emailChange";

export async function GET(req: Request) {

    const session = await getServerSession(authOptions);
    
    if(!session || !session.user){
        return NextResponse.json({error:"Not logged in"}, {status:401});
    }

    const payload = {
        id: session.user.id,
        email: session.user.email,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2),
    };

    try {
        const {origin} = new URL(req.url)
        const token = jwt.sign(payload, process.env.JWT_SECRET!);

        const url = `${origin}/update-email?token=${token}`

        const {error} = await resend.emails.send({
            from: "noReply@guitouni-studio.online",
            to: [session.user.email],
            subject: "Update Email",
            html: EmailChangeTemplate(url),
        });

        if (error) {
            throw new Error("Email not sent");
        }

        return NextResponse.json({ok : true})

    } catch (emailError) {
        console.log(emailError);
        return NextResponse.json({error:"Email not sent"}, {status:500});
    }
}