
import { supabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string
}

export async function POST(req:Request, {params:{user_id}}: {params:Params}) {
    
    let logoUrl: string | null = null;
    let companyId: string | null = null;

    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const database_id = formData.get('database_id') as string | null; 
        const industry = formData.get('industry') as string | null; 
        const logoFile = formData.get('logo') as File | null;

        if (!name || name.trim().length < 2) {
            return NextResponse.json({ error: "Company name is required and must be at least 2 characters." }, { status: 400 });
        }
        if (!description || description.trim().length < 10) {
            return NextResponse.json({ error: "Description is required and must be at least 10 characters." }, { status: 400 });
        }
        // Add other validations as needed

        // 1. Upload logo if present
        if (logoFile) {
            const filePath = `logos/${user_id}-${Date.now()}-${logoFile.name}`; // Unique path
            const { error: uploadError } = await supabase.storage
                .from('logos') // Specify the bucket name
                .upload(filePath, logoFile);

            if (uploadError) {
                console.error("Logo upload error:", uploadError);
                return NextResponse.json({ error: `Failed to upload logo: ${uploadError.message}` }, { status: 500 });
            }

            // Get public URL
            const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filePath);
            logoUrl = urlData?.publicUrl || null;
        }

        // 2. Insert company data
        const { data: insertData, error: insertError } = await supabase.from("company")
            .insert({ name, description, user_id, database_id, logo: logoUrl , industry })
            .select("id")
            .single();

        if (insertError) {
            console.error("Company insert error:", insertError);
            // Consider deleting the uploaded logo if insert fails
            return NextResponse.json({ error: `Failed to create company: ${insertError.message}` }, { status: 500 });
        }

        companyId = insertData.id;

        return NextResponse.json({ data: { id: companyId, logo_url: logoUrl } }); // Return ID and potentially logo URL

    } catch (error: any) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
    }
}
