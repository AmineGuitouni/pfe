import { supabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { resend } from "@/lib/resend";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { AddUserToCompanyTemplate } from "@/lib/emailtemplets/addUserToCompanyTemplate";

export async function GET(req: Request, {params: {company_id,user_id}}: {params: { company_id: string ,user_id: string}}) {
    try {
        const url = new URL(req.url);
        const { searchParams } = url;
        const email = searchParams.get("email");
        const groups = searchParams.getAll("groups");
        
        // Validate email and groups
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // if (!groups || groups.length === 0) {
        //     return NextResponse.json({ error: "At least one group is required" }, { status: 400 });
        // }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // Validate company_id
        if (!company_id || company_id.trim() === '') {
            return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
        }

        // Get company-specific database client
        const client = await getServerDBfromCompanyId(company_id,user_id);
          
        if (!client) {
            return NextResponse.json({ 
                error: "Failed to connect to database" 
            }, { status: 500 });
        }

        // Check if user already exists in the company database
        const { data, error: userError } = await client
            .from("users")
            .select("email")
            .eq("email", email)
            .eq("company_id", company_id)
            .single();

        if (userError && userError.code !== 'PGRST116') {
            console.error('Database query error:', userError);
            return NextResponse.json({ error: "Database query error" }, { status: 500 });
        }

        if (data?.email) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        // Fetch company name
        const { data: companyData, error: companyError } = await supabase
            .from("company")
            .select("name")
            .eq("id", company_id)
            .single();

        if (companyError) {
            console.error('Company fetch error:', companyError);
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        // Generate invitation token
        const payload = {
            email,
            company_id,
            groups,
            exp: Math.floor(Date.now() / 1000) + (60 * 20), // 20 minutes expiration
        };

        // Ensure JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET);
        const link = `${url.origin}/add-worker?token=${token}`;

        // Send invitation email
        const { error: mailError } = await resend.emails.send({
            from: "noReply@guitouni-amine.me",
            to: [email],
            subject: `You're Invited to Join ${companyData.name}`,
            html: AddUserToCompanyTemplate(link, companyData.name),
        });

        if (mailError) {
            console.error('Email send error:', mailError);
            return NextResponse.json({ 
                error: "Unable to send email, try again later" 
            }, { status: 500 });
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    }
    catch(error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}