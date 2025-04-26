
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid'; // For unique filenames

export async function PUT(req: Request, { params: { company_id } }: { params: { company_id: string } }) {
  try {

    console.log(company_id)
    const supabase = await getServerDBfromCompanyId(company_id);
    if (!supabase) {
        return NextResponse.json({ error: "Failed to connect to company database" }, { status: 500 });
    }

    const formData = await req.formData();
    const id = formData.get('id') as string | null;
    const first_name = formData.get('first_name') as string | null;
    const last_name = formData.get('last_name') as string | null;
    const country = formData.get('country') as string | null;
    const phone_number = formData.get('phone_number') as string | null;
    const avatarFile = formData.get('avatar') as File | null;

    // console.log("Received form data fields:", { id, first_name, last_name, country, phone_number, avatarFile: !!avatarFile });

    if (!id) {
      return NextResponse.json(
        { error: "User ID (id) is required in form data" },
        { status: 400 }
      );
    }

    if (!first_name?.trim() || !last_name?.trim() || !country?.trim() || !phone_number?.trim()) {
      return NextResponse.json(
        { error: "First name, last name, country, and phone number are required" },
        { status: 400 }
      );
    }

    let avatar_url: string | null = null;

    // --- Handle Avatar Upload ---
    if (avatarFile) {
       if (avatarFile.size > 5 * 1024 * 1024) { // Example size limit (5MB)
         return NextResponse.json({ error: "Avatar file size exceeds 5MB limit" }, { status: 400 });
       }
       if (!avatarFile.type.startsWith('image/')) {
          return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
       }

      const fileExtension = avatarFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `public/${fileName}`; // Path within the bucket

      // Use the company-specific Supabase client for storage
      const { error: uploadError } = await supabase.storage
        .from('avatars') // Ensure 'avatars' bucket exists in company DB schema
        .upload(filePath, avatarFile);

      if (uploadError) {
        console.error(`Supabase Storage upload error (Company: ${company_id}):`, uploadError);
        return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
      }

      // Get public URL from the company-specific storage
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      avatar_url = urlData?.publicUrl || null;
    }
    // --- End Avatar Upload ---

     // Prepare data for DB update
     const updateData: {
       first_name: string;
       last_name: string;
       country: string;
       phone_number: string;
       image?: string; // Make avatar_url optional
     } = {
       first_name: first_name.trim(),
       last_name: last_name.trim(),
       country: country.trim(),
       phone_number: phone_number.trim(),
     };

     if (avatar_url) {
       updateData.image = avatar_url; // Add URL only if upload was successful
     }

    // Update user data in the company-specific database
    const { data: updatedUser, error: updateDbError } = await supabase
      .from('users') // Assuming 'users' table exists in company DB schema
      .update(updateData)
      .eq('id', id)
      .select() // Select all columns to return updated user
      .single();

    if (updateDbError) {
      console.error(`Supabase DB update error (Company: ${company_id}):`, updateDbError);
      return NextResponse.json(
        { error: updateDbError.message || "Database error during profile update" },
        { status: 500 }
      );
    }

     // Return the updated user data (including the potentially new avatar_url)
     return NextResponse.json(updatedUser);

  } catch (error: any) {
     // Catch errors from formData parsing or other unexpected issues
    console.error("Update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}