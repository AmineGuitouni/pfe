import { supabase } from '@/lib/database/supabase';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { password, token, oldPassword } = await req.json();

        if (!token || !password || !oldPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const userId = decoded.id;

            // Fetch user from the database
            const { data: user, error: fetchError } = await supabase
                .from('users')
                .select('password_hash')
                .eq('id', userId)
                .single();

            if (fetchError || !user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Verify old password
            const isOldPassCorrect = await bcrypt.compare(oldPassword, user.password_hash);
            if (!isOldPassCorrect) {
                return NextResponse.json({ error: 'Invalid old password' }, { status: 401 });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update password in the database
            const { error: updateError } = await supabase
                .from('users')
                .update({ password_hash: hashedPassword })
                .eq('id', userId);

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                message: 'Password updated successfully!',
            }, { status: 200 });

        } catch (tokenError) {
            console.error('Token verification error:', tokenError);
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }
    } catch (error: any) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
    }
}
