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
        tool_calls?: any[];
        tool_call_id?: string;
        tool_name?: string;
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

        // Try to select with new columns first, fall back if they don't exist
        let data: any[] | null = null;
        let error: any = null;

        const resultWithNewCols = await supabase
            .from('command_center_sessions_messages')
            .select('id, session_id, sender, content, created_at, content_type, tool_calls, tool_call_id, tool_name')
            .eq('session_id', session_id)
            .order('created_at', { ascending: true });

        if (resultWithNewCols.error?.code === '42703') {
            // Column doesn't exist, fall back to old columns
            const resultOldCols = await supabase
                .from('command_center_sessions_messages')
                .select('id, session_id, sender, content, created_at, content_type')
                .eq('session_id', session_id)
                .order('created_at', { ascending: true });
            data = resultOldCols.data;
            error = resultOldCols.error;
        } else {
            data = resultWithNewCols.data;
            error = resultWithNewCols.error;
        }
        
        if (error) {
            console.error('Error fetching messages:', error);
            return NextResponse.json({ error: "Database Error" }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: "No messages found" }, { status: 404 });
        }
        
        return NextResponse.json({
            data: data.map((message:any) => {
                // Parse tool_calls if it's a string
                let toolCalls = message.tool_calls;
                if (typeof toolCalls === 'string') {
                    try {
                        toolCalls = JSON.parse(toolCalls);
                    } catch (e) {
                        toolCalls = null;
                    }
                }

                return {
                    id: message.id,
                    session_id: message.session_id,
                    sender: message.sender,
                    content: message.content,
                    created_at: message.created_at,
                    type: message.content_type || 'text',
                    tool_calls: toolCalls || undefined,
                    tool_call_id: message.tool_call_id || undefined,
                    tool_name: message.tool_name || undefined
                };
            })
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error in GET:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}