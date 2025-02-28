import { createClient } from '@supabase/supabase-js'
import jwt from "jsonwebtoken";

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_KEY!);
export const authedSupabase = (userId: string) => {
    const supabaseTokenPayload = {
        sub: userId,
        ref: "tbnfcrturvesuzrlsldk",
        role: "service_role",
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 10),
    }
    
    const supabase_token = jwt.sign(supabaseTokenPayload, process.env.SUPABASE_JWT_SECRET!)
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_KEY! ,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${supabase_token}`
                }
            }
        }
    )

    return client
}