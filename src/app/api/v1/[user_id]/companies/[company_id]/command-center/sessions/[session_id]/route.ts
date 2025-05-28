export const fetchCache = "force-no-store"
import { prepareAgentMessages } from "@/lib/ai/agent/helper/prepareMessages";
import { agentResponseGeneration } from "@/lib/ai/agent/helper/agentGeneration";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string;
    session_id: string;
}


export type CommandCenterRequest = {
    user_prompt?: string;
    accept_tool_call?: boolean;
    reject_tool_call?: boolean;
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
    try{
        const { user_id, company_id, session_id } = params;
        const supabase = await getServerDBfromCompanyId(company_id);

        if (!supabase) {
            return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
        }

        const { data:sessionData, error: sessionError } = await supabase
            .from('command_center_sessions')
            .select('id, name, mode')
            .eq('id', session_id)
            .eq('user_id', user_id)
            .eq('company_id', company_id)
            .single()

        if (sessionError) {
            console.error('Error fetching session:', sessionError);
            return NextResponse.json({ error: "Database Error" }, { status: 500 });
        }

        if(sessionData.mode ===  "cli"){
            // CLI mode implementation - placeholder for now
            return NextResponse.json({ error: "CLI mode not implemented yet" }, { status: 501 });
        }
        else if(sessionData.mode === "chat"){
            const body = await req.json() as CommandCenterRequest ;

            const { user_prompt, accept_tool_call, reject_tool_call } = body;
            
            try {
                const {messagesHistory: messages, savedMessage} = await prepareAgentMessages({
                    supabase,
                    chat_session: session_id,
                    userPrompt: user_prompt,
                    acceptToolCall:accept_tool_call,
                    rejectToolCall:reject_tool_call,
                    companyId: company_id,
                    userId: user_id
                });

                const response = await agentResponseGeneration({
                    messages
                });

                // Save the complete AI message to the database
                const { data: savedAiMessage, error: saveError } = await supabase
                    .from('command_center_sessions_messages')
                    .insert({
                        session_id: session_id,
                        sender: 'ai',
                        content: response,
                        created_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (saveError) {
                    console.error('Error saving AI message:', saveError);
                    throw saveError;
                }
                
                return NextResponse.json({ 
                    response, 
                    response_id: savedAiMessage.id,
                    user_message_id: savedMessage.sender === 'user' ? savedMessage.id : null,
                    toolCallMessage: savedMessage.sender === 'tool' ? {
                        id: savedMessage.id,
                        content: savedMessage.content
                    } : null
                }, { status: 200 });
            } catch (error) {
                console.error('Error in chat mode with user message:', error);
                return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to process user message" }, { status: 500 });
            }
        }
        else {
            return NextResponse.json({ error: "Invalid session mode" }, { status: 400 });
        }
    }
    catch (error) {
        console.error('Error in POST:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}