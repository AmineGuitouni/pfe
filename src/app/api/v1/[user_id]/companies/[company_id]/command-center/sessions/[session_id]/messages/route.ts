import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

export const fetchCache = "force-no-store"

interface Params {
    user_id: string;
    company_id: string;
    session_id: string;
}

export interface MessagesRouteResponse {
    data?: {
        id: string;
        session_id: string;
        sender: 'user' | 'ai' | 'tool';
        content: string;
        created_at: string;
        type: 'text' | 'audio';
    }[];
    error?: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
    try{
        const { company_id, session_id } = params;
        const supabase = await getServerDBfromCompanyId(company_id);

        if (!supabase) {
            return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('command_center_sessions_messages')
            .select('id, session_id, sender, content, created_at, content_type')
            .eq('session_id', session_id)
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('Error fetching messages:', error);
            return NextResponse.json({ error: "Database Error" }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: "No messages found" }, { status: 404 });
        }
        
        return NextResponse.json({
            data: data.map((message:any) => ({
                id: message.id,
                session_id: message.session_id,
                sender: message.sender,
                content: message.content,
                created_at: message.created_at,
                type: message.content_type || 'text'
            }))
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error in GET:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}