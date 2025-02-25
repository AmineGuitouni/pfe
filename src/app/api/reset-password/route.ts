import { supabase } from '@/lib/database/supabase';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { password, token } = await req.json();
        
        if (!token || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            
            // Check if token is expired (JWT will throw if expired, but double-check)
            if (Date.now() >= decoded.exp * 1000) {
                return NextResponse.json({ error: 'Token has expired' }, { status: 401 });
            }
            
            const userId = decoded.id;
            
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const { error: updateError } = await supabase
                .from('users')
                .update({ password_hash: hashedPassword })
                .eq('id', userId);
                
            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }
            
            return NextResponse.json({ 
                success: true, 
                message: 'Password updated successfully!' 
            }, { status: 200 });
            
        } catch (tokenError) {
            console.error('Token verification error:', tokenError);
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }
    } catch (error: any) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
