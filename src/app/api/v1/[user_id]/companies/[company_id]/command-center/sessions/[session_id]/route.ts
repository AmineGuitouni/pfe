export const fetchCache = "force-no-store"
import { prepareAgentMessages, SaveMessage } from "@/lib/ai/agent/helper/prepareMessages";
import { agentResponseGeneration, AgentGenerationResult } from "@/lib/ai/agent/helper/agentGeneration";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";
import { generateAIAudio } from "@/lib/ai/agent/helper/generateAIAudio";
import { parseCommandToJson } from "@/features/dashboard/command-center/utils";
import { predefinedCommands } from "@/features/dashboard/command-center/constants/commandsFunctions";
import { OpenAIToolCall } from "@/lib/ai/agent/tools/toolSchema";

interface Params {
    user_id: string;
    company_id: string;
    session_id: string;
}


export type CommandCenterRequest = {
    user_prompt?: string;
    user_content_type?: "text" | "audio";
    accept_tool_call?: boolean;
    reject_tool_call?: boolean;
    audioResponse?: boolean;
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
            console.error('Error fetching session:', sessionError)
            return NextResponse.json({ error: "Database Error" }, { status: 500 });
        }

        if(sessionData.mode ===  "cli"){
            const {command} = await req.json();
            console.log(command, typeof command);
            if (!command || typeof command !== 'string') {
                console.log("Invalid command format");
                return NextResponse.json({ error: "Invalid command format" }, { status: 400 });
            }
            
            // Parse the command to extract the function name and arguments
            const commandParsed = parseCommandToJson(command);
            if ('error' in commandParsed) {
                console.log("Error parsing command:", commandParsed.error);
                return NextResponse.json({ error: commandParsed.error }, { status: 400 });
            }

            const commandFunction = predefinedCommands[commandParsed.command_name];
            if (!commandFunction) {
                return NextResponse.json({ error: `Command ${commandParsed.command_name} not found` }, { status: 404 });
            }

            console.log("Command:", commandParsed);

            const funcRes = await commandFunction({
                company_id,
                user_id,
                ...commandParsed.parameters
            });

            const resData = {
                name: commandParsed.command_name,
                output: funcRes
            }

            const {data: userMessage, error: userMessageError} = await supabase
                .from('command_center_sessions_messages')
                .insert({
                    session_id: session_id,
                    sender: 'user',
                    content: command,
                })
                .select('id')
                .single();

            if (userMessageError) {
                console.error('Error saving user message:', userMessageError);
                return NextResponse.json({ error: "Failed to save user message" }, { status: 500 });
            }
            if (!userMessage || !userMessage.id) {
                console.error('User message saved but no ID returned:', userMessage);
                return NextResponse.json({ error: "User message saved but no ID returned" }, { status: 500 });
            }

            // Save the function response as an AI message
            const { data: aiMessage, error: aiMessageError } = await supabase
                .from('command_center_sessions_messages')
                .insert({
                    session_id: session_id,
                    sender: 'tool',
                    content: "```tool_result\n" + JSON.stringify(resData, null, 2) + "\n```",
                    created_at: new Date().toISOString()
                })
                .select('id')
                .single();
            if (aiMessageError) {
                console.error('Error saving AI message:', aiMessageError);
                return NextResponse.json({ error: "Failed to save AI message" }, { status: 500 });
            }
            if (!aiMessage || !aiMessage.id) {
                console.error('AI message saved but no ID returned:', aiMessage);
                return NextResponse.json({ error: "AI message saved but no ID returned" }, { status: 500 });
            }

            return NextResponse.json({
                response: "```tool_result\n" + JSON.stringify(resData, null, 2) + "\n```",
                response_id: aiMessage.id,
                user_message_id: userMessage.id,
            })
        }
        else if(sessionData.mode === "chat"){
            const body = await req.json() as CommandCenterRequest ;

            const { user_prompt, accept_tool_call, reject_tool_call } = body;
            const user_content_type = body.user_content_type || "text";
            if(user_content_type !== "text" && user_content_type !== "audio") {
                return NextResponse.json({ error: "Invalid user content type" }, { status: 400 });
            }

            try {
                // Prepare agent messages with enhanced error handling
                let messagesResult;
                try {
                    messagesResult = await prepareAgentMessages({
                        supabase,
                        chat_session: session_id,
                        userPrompt: user_content_type === 'text' ? user_prompt: undefined,
                        userAudioPrompt: user_content_type === 'audio' ? user_prompt : undefined,
                        acceptToolCall: accept_tool_call,
                        rejectToolCall: reject_tool_call,
                        companyId: company_id,
                        userId: user_id
                    });
                } catch (prepareError) {
                    console.error('Error preparing agent messages:', {
                        error: prepareError,
                        session_id,
                        company_id,
                        user_id,
                        user_content_type
                    });
                    
                    if (prepareError instanceof Error) {
                        // Check for specific error types
                        if (prepareError.message.includes('session not found') || prepareError.message.includes('invalid session')) {
                            return NextResponse.json({ error: "Session not found or invalid" }, { status: 404 });
                        }
                        if (prepareError.message.includes('permission') || prepareError.message.includes('unauthorized')) {
                            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
                        }
                        if (prepareError.message.includes('database') || prepareError.message.includes('connection')) {
                            return NextResponse.json({ error: "Database connection error" }, { status: 503 });
                        }
                    }
                    
                    return NextResponse.json({
                        error: "Failed to prepare messages for AI processing",
                        details: prepareError instanceof Error ? prepareError.message : "Unknown error"
                    }, { status: 500 });
                }

                // Validate the result from prepareAgentMessages
                if (!messagesResult || typeof messagesResult !== 'object') {
                    console.error('Invalid response from prepareAgentMessages:', messagesResult);
                    return NextResponse.json({ error: "Invalid message preparation result" }, { status: 500 });
                }

                const { messagesHistory: messages, savedMessage } = messagesResult;

                // Validate messages array
                if (!Array.isArray(messages) || messages.length === 0) {
                    console.error('No valid messages prepared for AI processing:', { messages, session_id });
                    return NextResponse.json({ error: "No messages available for processing" }, { status: 400 });
                }
                
                // Generate AI response with enhanced error handling
                let aiResult: AgentGenerationResult;
                try {
                    aiResult = await agentResponseGeneration({
                        messages
                    });
                } catch (generationError) {
                    console.error('Error generating AI response:', {
                        error: generationError,
                        session_id,
                        messagesCount: messages.length,
                        company_id,
                        user_id
                    });
                    
                    if (generationError instanceof Error) {
                        // Check for specific AI service errors
                        if (generationError.message.includes('rate limit') || generationError.message.includes('quota')) {
                            return NextResponse.json({ error: "AI service rate limit exceeded. Please try again later." }, { status: 429 });
                        }
                        if (generationError.message.includes('content policy') || generationError.message.includes('safety')) {
                            return NextResponse.json({ error: "Content violates AI safety policies" }, { status: 400 });
                        }
                        if (generationError.message.includes('timeout')) {
                            return NextResponse.json({ error: "AI response generation timed out" }, { status: 504 });
                        }
                        if (generationError.message.includes('API key') || generationError.message.includes('authentication')) {
                            return NextResponse.json({ error: "AI service authentication error" }, { status: 503 });
                        }
                    }
                    
                    return NextResponse.json({
                        error: "Failed to generate AI response",
                        details: generationError instanceof Error ? generationError.message : "Unknown error"
                    }, { status: 500 });
                }

                const { content: response, toolCalls } = aiResult;

                // Validate AI response - must have either content or tool calls
                if (!response && (!toolCalls || toolCalls.length === 0)) {
                    console.error('Invalid AI response received:', { response, toolCalls, session_id });
                    return NextResponse.json({ error: "Invalid AI response generated" }, { status: 500 });
                }

                // Save the complete AI message to the database with error handling
                let savedAiMessage;
                try {
                    // First try without tool_calls column (for backwards compatibility)
                    const { data, error: saveError } = await supabase
                        .from('command_center_sessions_messages')
                        .insert({
                            session_id: session_id,
                            sender: 'ai',
                            content: response || '',
                            created_at: new Date().toISOString()
                        })
                        .select('id')
                        .single();

                    if (saveError) {
                        console.error('Error saving AI message to database:', {
                            error: saveError,
                            session_id,
                            company_id,
                            user_id
                        });
                        throw new Error(`Database save error: ${saveError.message}`);
                    }

                    savedAiMessage = data;

                    // Try to update with tool_calls if we have them (column may not exist)
                    if (toolCalls && toolCalls.length > 0 && savedAiMessage?.id) {
                        try {
                            await supabase
                                .from('command_center_sessions_messages')
                                .update({ tool_calls: JSON.stringify(toolCalls) })
                                .eq('id', savedAiMessage.id);
                        } catch (e) {
                            // Column might not exist yet, store tool calls in content as fallback
                            console.log('Could not save tool_calls column, using fallback in content');
                        }
                    }
                } catch (saveError) {
                    console.error('Failed to save AI message:', saveError);
                    
                    // Return the AI response even if saving fails, but log the error
                    return NextResponse.json({
                        response,
                        toolCalls,
                        warning: "Response generated successfully but failed to save to database",
                        ...(savedMessage ? {
                            user_message_id: savedMessage.sender === 'user' ? savedMessage.id : null,
                            toolCallMessage: savedMessage.sender === 'tool' ? {
                                id: savedMessage.id,
                                content: savedMessage.content
                            } : null
                        } : {})
                    }, { status: 200 });
                }

                // Validate saved message
                if (!savedAiMessage || !savedAiMessage.id) {
                    console.error('AI message saved but no ID returned:', savedAiMessage);
                    return NextResponse.json({
                        response,
                        toolCalls,
                        warning: "Response generated but message ID not available",
                        ...(savedMessage ? {
                            user_message_id: savedMessage.sender === 'user' ? savedMessage.id : null,
                            toolCallMessage: savedMessage.sender === 'tool' ? {
                                id: savedMessage.id,
                                content: savedMessage.content
                            } : null
                        } : {})
                    }, { status: 200 });
                }

                let aiAudioResponse:string|undefined = undefined
                const {audioResponse} = body;
                if(audioResponse && typeof audioResponse === 'boolean' && audioResponse && response) {
                    aiAudioResponse = await generateAIAudio({
                        text: response,
                        baseUrl: "http://localhost:8000",
                        supabase,
                        bucketName: "chat",
                        folderName: "ai-audio",
                    })
                }
                
                return NextResponse.json({
                    response,
                    toolCalls,
                    response_id: savedAiMessage.id,
                    aiAudioResponse,
                    ...(savedMessage ? {
                        user_message_id: savedMessage.sender === 'user' ? savedMessage.id : null,
                        toolCallMessage: savedMessage.sender === 'tool' ? {
                            id: savedMessage.id,
                            content: savedMessage.content
                        } : null
                    } : {})
                }, { status: 200 });
            } catch (error) {
                console.error('Unexpected error in chat mode processing:', {
                    error,
                    session_id,
                    company_id,
                    user_id,
                    user_content_type,
                    stack: error instanceof Error ? error.stack : undefined
                });
                
                return NextResponse.json({
                    error: "An unexpected error occurred while processing your request",
                    details: error instanceof Error ? error.message : "Unknown error"
                }, { status: 500 });
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