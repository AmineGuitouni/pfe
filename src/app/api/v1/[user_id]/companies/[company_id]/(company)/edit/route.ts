import { authedSupabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";
import { URL } from 'url'; // Import URL for parsing

interface Params{user_id: string, company_id: string}

export async function PUT(req: Request, {params: {user_id, company_id}}: {params: Params}){
    const supabase = authedSupabase(user_id);
    let newLogoUrl: string | null | undefined = undefined; 

    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const industry = formData.get('industry') as string;
        const database_id_form = formData.get('database_id') as string | null;
        const database_id = database_id_form === '' ? null : database_id_form;
        const logoFile = formData.get('logo') as File | null;

        // --- Validation ---
        if (!name || name.trim().length < 2) {
            return NextResponse.json({ error: "Company name is required and must be at least 2 characters." }, { status: 400 });
        }
        if (description && description.trim().length < 10) {
             return NextResponse.json({ error: "Description must be at least 10 characters long." }, { status: 400 });
        }
         if (industry && industry.trim().length < 2) {
             return NextResponse.json({ error: "Industry must be at least 2 characters long." }, { status: 400 });
        }
        // Add other validations as needed

        // --- Logo Handling ---
        if (logoFile) {
            // 1. Get old logo URL to delete the file
            const { data: currentCompany, error: fetchError } = await supabase
                .from('company')
                .select('logo')
                .eq('id', company_id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // Ignore 'No rows found' error if it's a new company somehow?
                console.error("Error fetching current company logo:", fetchError);
                // Decide if this should block the update or just skip deletion
            }

            // 2. Delete old logo if exists
            if (currentCompany?.logo) {
                try {
                    const oldUrl = new URL(currentCompany.logo);
                    const oldFilePath = oldUrl.pathname.split('/logos/')[1]; // Extract path after bucket name
                    if (oldFilePath) {
                        const { error: deleteError } = await supabase.storage.from('logos').remove([oldFilePath]);
                        if (deleteError) {
                            console.error("Error deleting old logo:", deleteError);
                            // Decide if this should block the update or just log the error
                        }
                    }
                } catch (parseError) {
                    console.error("Error parsing old logo URL:", parseError);
                }
            }

            // 3. Upload new logo
            const filePath = `logos/${user_id}-${company_id}-${Date.now()}-${logoFile.name}`; // Unique path including company_id
            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, logoFile);

            if (uploadError) {
                console.error("Logo upload error:", uploadError);
                return NextResponse.json({ error: `Failed to upload new logo: ${uploadError.message}` }, { status: 500 });
            }

            // 4. Get public URL for the new logo
            const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filePath);
            newLogoUrl = urlData?.publicUrl; // Assign the new URL
        }

        // --- Database Update ---
        const updateData: { [key: string]: any } = {
            name: name.trim(),
            description: description.trim(),
            industry: industry.trim(),
            database_id: database_id // This can be null
        };

        // Only include logo_url in update if a new one was generated
        if (newLogoUrl !== undefined) {
            updateData.logo = newLogoUrl;
        }

        const { error: updateError } = await supabase
            .from("company")
            .update(updateData)
            .eq("id", company_id)
            .eq("user_id", user_id); // Ensure user owns the company

        if (updateError) {
            console.error("Company update error:", updateError);
            // Consider deleting the newly uploaded logo if update fails
            return NextResponse.json({ error: `Failed to update company: ${updateError.message}` }, { status: 500 });
        }

        // Return success and the potentially updated logo URL
        // Fetch the potentially updated company logo URL to return the most current one
        const { data: updatedCompanyData, error: fetchUpdatedError } = await supabase
            .from('company')
            .select('logo')
            .eq('id', company_id)
            .single();

        if (fetchUpdatedError) {
             console.error("Error fetching updated company data:", fetchUpdatedError);
             // Fallback or handle error - returning potentially stale data might be okay here
        }

        return NextResponse.json({ data: { logo_url: updatedCompanyData?.logo } });


    } catch (error: any) {
        console.error("Error processing PUT request:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
    }
}
