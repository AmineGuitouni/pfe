
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";


export async function POST(req: Request) {
    try {
        
        const {token,first_name, last_name, password,country ,phone_number} = await req.json();
        
        // Validate email
        if (!token) {
            return NextResponse.json({ error: "token is required" }, { status: 400 });
        }

        if(!first_name || !last_name || !password || !country || !phone_number){
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            
            // Check if token is expired (JWT will throw if expired, but double-check)
            if (Date.now() >= decoded.exp * 1000) {
                return NextResponse.json({ error: 'Token has expired' }, { status: 401 });
            }
            
            const email = decoded.email;
            const company_id = decoded.company_id;
            
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Get company-specific database client
        const client = await getServerDBfromCompanyId(company_id);
          
        if (!client) {
            return NextResponse.json({ 
                error: "Failed to connect to database" 
            }, { status: 500 });
        }

        // Check if user already exists in the company database
        const { error: userError } = await client
            .from("users")
            .insert({
                first_name,
                last_name,
                email,
                password_hash: hashedPassword,
                country,
                phone_number,
                company_id
            })
            .single();

        if (userError) {
            console.error('User creation error:', userError);
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

            
            return NextResponse.json({ 
                success: true, 
                message: 'user registered successfully!' 
            }, { status: 200 });
            
        } catch (tokenError) {
            console.error('Token verification error:', tokenError);
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

    }
    catch(error) {
        console.error('Unhandled error:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}