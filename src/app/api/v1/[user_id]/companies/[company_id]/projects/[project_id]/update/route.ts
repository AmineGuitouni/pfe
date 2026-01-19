import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string;
    project_id: string;
}

interface ProjectUpdateRequestBody {
    name?: string;
    description?: string;
    deadline?: string | null;
}

export async function PATCH(request: Request, { params: { company_id, project_id, user_id } }: { params: Params }) {
    try {
        const body: ProjectUpdateRequestBody = await request.json();
        
        const supabase = await getServerDBfromCompanyId(company_id, user_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        // Build update object with only provided fields
        const updateData: Record<string, any> = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.deadline !== undefined) updateData.deadline = body.deadline;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const { data: updatedProject, error: updateError } = await supabase
            .from("projects")
            .update(updateData)
            .eq("id", project_id)
            .eq("company_id", company_id)
            .select("id, name, description, deadline")
            .single();

        if (updateError) {
            console.error("Error updating project:", updateError);
            return NextResponse.json({ error: `Failed to update project: ${updateError.message}` }, { status: 500 });
        }

        return NextResponse.json({ data: updatedProject }, { status: 200 });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
