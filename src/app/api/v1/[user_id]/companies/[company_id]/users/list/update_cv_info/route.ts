import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params: { company_id } }: { params: { company_id: string } }) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        
        console.log("API call received for CV update:", { company_id, id });
        
        if (!id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const cvData = body.cvData;

        if (!cvData) {
            return NextResponse.json(
                { error: "CV data is required" },
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

        // Check if CV record exists
        const { data: existingData } = await client
            .from("cv_informations")
            .select("id")
            .eq("user_id", id)
            .single();

        let result;
        
        if (existingData) {
            // Update existing record
            result = await client
                .from("cv_informations")
                .update({
                    summary: cvData.summary,
                    skills: cvData.skills,
                    workExperience: cvData.workExperience,
                    education: cvData.education,
                    languages: cvData.languages,
                    certifications: cvData.certifications,
                    projects: cvData.projects,
                    strengths: cvData.strengths,
                    recommendedTaskTypes: cvData.recommendedTaskTypes,
                })
                .eq("user_id", id)
                .select();
        } else {
            // Create new record
            result = await client
                .from("cv_informations")
                .insert({
                    user_id: id,
                    summary: cvData.summary,
                    skills: cvData.skills,
                    workExperience: cvData.workExperience,
                    education: cvData.education,
                    languages: cvData.languages,
                    certifications: cvData.certifications,
                    projects: cvData.projects,
                    strengths: cvData.strengths,
                    recommendedTaskTypes: cvData.recommendedTaskTypes,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select();
        }

        if (result.error) {
            console.error("Database update error:", result.error);
            return NextResponse.json(
                { error: "Failed to update CV information" },
                { status: 500 }
            );
        }
        
        console.log("CV information updated successfully");
        
        return NextResponse.json({ 
            data: result.data[0],
            message: "CV information updated successfully" 
        });
    } catch (error) {
        console.error("Unexpected error in CV update API:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred", details: String(error) },
            { status: 500 }
        );
    }
}
