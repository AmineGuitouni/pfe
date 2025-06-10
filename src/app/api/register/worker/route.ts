import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";

export async function POST(req: Request) {
    try {
        const {token, first_name, last_name, password, country, phone_number} = await req.json();
        
        // Validate input
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
            const groups = decoded.groups;
            
            // Validate groups
            if (!groups || !Array.isArray(groups) || groups.length === 0) {
                return NextResponse.json({ error: 'No groups specified for user' }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Get company-specific database client
            const client = await getServerDBfromCompanyId(company_id);
              
            if (!client) {
                return NextResponse.json({ 
                    error: "Failed to connect to database" 
                }, { status: 500 });
            }

            // Create the user
            const { data: user, error: userError } = await client
                .from("users")
                .insert({
                    first_name,
                    last_name,
                    email,
                    password_hash: hashedPassword,
                    country,
                    phone_number,
                    company_id,
                })
                .select("id")
                .single();

            if (userError) {
                console.error('User creation error:', userError);
                return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
            }

            if (groups && groups.length === 0) {
            // Prepare group assignments for batch insert
            const groupAssignments = groups.map(group_id => ({
                user_id: user.id,
                group_id
            }));

            // Insert all group assignments
            const { error: groupError } = await client
                .from("user_groups")
                .insert(groupAssignments);

            if (groupError) {
                console.error('Group assignment error:', groupError);
                return NextResponse.json({ error: 'Failed to assign groups' }, { status: 500 });
            }
                
            return NextResponse.json({ 
                success: true, 
                message: 'User registered successfully!' 
            }, { status: 200 });
            }
            
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