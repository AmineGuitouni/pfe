import { supabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt"; 
import { authOptions } from "@/lib/auth/authOptions";
import { getServerSession } from "next-auth";

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)

        const password  = searchParams.get("password");

        if(!password){
            return NextResponse.json({error: "Password is required"}, {status: 400});
        }
        
        console.log(password);

        const session = await getServerSession(authOptions);

        console.log(session)

        if (!session) {
            return NextResponse.json({ error: "Not logged in" }, { status: 401 });
        }

        const { data: userData, error: fetchError } = await supabase
            .from("users")
            .select("password_hash")
            .eq("id", session.user.id)
            .single();

        if (fetchError) {
            console.log(fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(password, userData.password_hash);

        if (!isMatch) {
            return NextResponse.json({ error: "Invalid password" }, { status: 403 });
        }

        const { data: deleteData, error: deleteError } = await supabase
            .from("users")
            .delete()
            .eq("id", session.user.id);

        if (deleteError) {
            console.log(deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: deleteData });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}