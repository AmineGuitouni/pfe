import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import {  NextResponse } from "next/server";

export async function GET(req: Request, { params: { company_id } }: { params: { company_id: string } }) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        
        console.log("API call received for CV information:", { company_id, id });
        
        if (!id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }
        
        const client = await getServerDBfromCompanyId(company_id);
        
        if (!client) {
            return NextResponse.json(
                { error: "Failed to connect to database" },
                { status: 500 }
            );
        }
        
        // Query the cv_informations table directly using the user_id field
        const { data, error } = await client
            .from("cv_informations")
            .select(`
                summary,
                skills,
                workExperience,
                education,
                languages,
                certifications,
                projects,
                strengths,
                recommendedTaskTypes
            `)
            .eq("user_id", id)
            .single();

        if(!data){
            return NextResponse.json(
                { error: "CV information not found" },
                { status: 200 }
            );
        }
            
        if (error) {
            console.error("Database query error:", error);
            return NextResponse.json(
                { error: error|| "Failed to fetch CV information" },
                { status: 500 }
            );
        }
        
        console.log("CV information retrieved:", { hasData: !!data });
        
        // Return whatever data we have, even if null
        return NextResponse.json({ data });
    } catch (error) {
        console.error("Unexpected error in CV information API:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred", details: String(error) },
            { status: 500 }
        );
    }
}