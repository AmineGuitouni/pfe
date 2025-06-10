import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

export const fetchCache = "force-no-store"

interface Params {
    user_id: string;
    company_id: string
}

export interface ListSessionsResponse {
    data?:{
        sessions: {
            id: string;
            name: string;
            mode: string;
            created_at: string;
        }[]
    },
    error?: string
}

export async function GET(req: Request, {params}:{params:Params}) {
    try {
        const { user_id, company_id } = params;
        const url = new URL(req.url);
        const mode = url.searchParams.get('mode');
        
        // Validate mode parameter if provided
        if (mode && !['cli', 'chat'].includes(mode)) {
            return NextResponse.json({ error: 'Invalid mode. Must be either "cli" or "chat"' }, { status: 400 });
        }
        
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
        }

        let query = supabase
            .from('command_center_sessions')
            .select('id, name, mode, created_at')
            .eq('user_id', user_id)
            .eq('company_id', company_id);
            
        // Add mode filter if provided
        if (mode) {
            query = query.eq('mode', mode);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sessions:', error);
            return NextResponse.json({ error: "Database Error" }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: "No sessions found" }, { status: 404 });
        }
        return NextResponse.json({
            data: {
                sessions: data.map((session:any) => ({
                    id: session.id,
                    name: session.name,
                    mode: session.mode,
                    created_at: session.created_at
                }))
            }
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error in GET:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}