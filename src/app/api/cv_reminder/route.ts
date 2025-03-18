import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { CVUploadReminderTemplate } from "@/lib/emailtemplets/cvReminderTemplate";

export async function GET(req: Request) {

    try{
        const url = new URL(req.url);
        const {searchParams} = url
        const email = searchParams.get("email")
        
        if(!email || !email.trim().length){
            return NextResponse.json({error: "Email is required"}, {status: 400});
        }

        const link = `${url.origin}/provide_cv`

        const {error: mailError} = await resend.emails.send({
            from: "noReply@guitouni-studio.online",
            to: [email],
            subject: "Upload cv reminder",
            html: CVUploadReminderTemplate(link),
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
