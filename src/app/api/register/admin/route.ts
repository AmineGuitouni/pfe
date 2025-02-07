import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/database/supabase";

export async function POST(req: Request) {
    console.log("hello")
    try {
        const { first_name, last_name, country, email, password, phone_number } = await req.json();
        console.log(first_name, last_name, country, email, password, phone_number);

        if (!first_name || !last_name || !country || !email || !password || !phone_number) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert the user into the database
        const { data, error } = await supabase
            .from("users")
            .insert({ first_name, last_name, country, email, password_hash, phone_number })
            .select();

        if (error) {
            console.error(error);
            throw error;
        }

        return NextResponse.json({ message: "User registered successfully", user: data }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "An error occurred" }, { status: 500 });
    }
}
