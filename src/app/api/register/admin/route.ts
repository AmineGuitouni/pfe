import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/database/supabase";
import { resend } from "@/lib/resend";
import { VerificationEmailTemplate } from "@/lib/emailtemplets/verificationEmail";
import jwt from "jsonwebtoken";

// Validation helper functions
const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    return {
        isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
        errors: [
            !minLength && "Password must be at least 8 characters long",
            !hasUpperCase && "Password must contain at least one uppercase letter",
            !hasLowerCase && "Password must contain at least one lowercase letter",
            !hasNumber && "Password must contain at least one number",
            !hasSpecialChar && "Password must contain at least one special character",
        ].filter(Boolean),
    };
};

const isValidPhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
};

export async function POST(req: Request) {
    try {
        const { first_name, last_name, country, email, password, phone_number } = await req.json();

        // Basic input validation
        if (!first_name || !last_name || !country || !email || !password || !phone_number) {
            return NextResponse.json({ 
                error: "All fields are required",
                field: "general"
            }, { status: 400 });
        }

        // Validate email format
        if (!isValidEmail(email.trim().toLowerCase())) {
            return NextResponse.json({ 
                error: "Invalid email format",
                field: "email"
            }, { status: 400 });
        }

        // Check if email already exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("email")
            .eq("email", email.trim().toLowerCase())
            .single();

        if (existingUser) {
            return NextResponse.json({ 
                error: "This email is already registered",
                field: "email",
                code: "EMAIL_EXISTS"
            }, { status: 400 });
        }

        // Validate password
        const passwordValidation = isValidPassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json({ 
                error: passwordValidation.errors.join(". "),
                field: "password"
            }, { status: 400 });
        }

        // Validate phone number
        if (!isValidPhoneNumber(phone_number)) {
            return NextResponse.json({ 
                error: "Invalid phone number format (e.g., +1234567890)",
                field: "phoneNumber"
            }, { status: 400 });
        }

        // Check if phone number already exists
        const { data: existingPhone } = await supabase
            .from("users")
            .select("phone_number")
            .eq("phone_number", phone_number.trim())
            .single();

        if (existingPhone) {
            return NextResponse.json({ 
                error: "This phone number is already registered",
                field: "phoneNumber"
            }, { status: 400 });
        }

        // Validate name length and format
        if (first_name.length < 2 || first_name.length > 50) {
            return NextResponse.json({ 
                error: "First name must be between 2 and 50 characters",
                field: "firstName"
            }, { status: 400 });
        }

        if (last_name.length < 2 || last_name.length > 50) {
            return NextResponse.json({ 
                error: "Last name must be between 2 and 50 characters",
                field: "lastName"
            }, { status: 400 });
        }

        // Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert the user into the database
        const { data, error: dbError } = await supabase
            .from("users")
            .insert({
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                country: country.trim(),
                email: email.trim().toLowerCase(),
                password_hash,
                phone_number: phone_number.trim(),
            })
            .select();

        if (dbError) {
            console.error("Database error:", dbError);
            throw new Error("Failed to create user account");
        }

        // Generate verification token
        const payload = {
            email: email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours expiration
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!);
        const origin = req.headers.get("origin");
        const verificationUrl = `${origin}/verify?token=${token}`;

        // Send verification email
        try {
            await resend.emails.send({
                from: 'noReply@guitouni-studio.online',
                to: [email.trim().toLowerCase()],
                subject: 'Verify Your Email Address',
                html: VerificationEmailTemplate(verificationUrl),
            });
        } catch (emailError) {
            console.error("Email sending error:", emailError);
            // Don't fail the registration if email fails, but log it
            // You might want to implement a retry mechanism or queue system
        }

        return NextResponse.json({ 
            message: "User registered successfully. Please check your email to verify your account.", 
            user: data 
        }, { status: 201 });

    } catch (err) {
        console.error("Registration error:", err);
        return NextResponse.json({ 
            error: err instanceof Error ? err.message : "An error occurred during registration",
            field: "submit"
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const {searchParams, origin} = new URL(req.url)
        const email = searchParams.get("email")?.trim().toLocaleLowerCase() || null

        if(!email){
            console.log("no email")
            return NextResponse.json({ 
                error: "No email provided",
            }, { status: 400 });
        }

        // Generate verification token
        const payload = {
            email: email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours expiration
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!);
        const verificationUrl = `${origin}/verify?token=${token}`;

        // Send verification email
        try {
            await resend.emails.send({
                from: 'noReply@guitouni-studio.online',
                to: [email],
                subject: 'Verify Your Email Address',
                html: VerificationEmailTemplate(verificationUrl),
            });
        } catch (emailError) {
            console.error("Email sending error:", emailError);
            // Don't fail the registration if email fails, but log it
            // You might want to implement a retry mechanism or queue system
        }

        return NextResponse.json({
            ok:"success"
        }, {status:200})
    }
    catch (err) {
        console.error("Registration error:", err);
        return NextResponse.json({ 
            error: err instanceof Error ? err.message : "An error occurred during registration",
            field: "submit"
        }, { status: 500 });
    }
}