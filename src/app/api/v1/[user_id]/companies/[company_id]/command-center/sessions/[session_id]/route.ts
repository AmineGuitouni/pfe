export const fetchCache = "force-no-store"
import { getPrompt } from "@/lib/ai/agent/prompt";
import { agentClient, agentModelName } from "@/lib/ai/openai";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ChatCompletionChunk, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Stream } from "openai/streaming.mjs";

interface Params {
    user_id: string;
    company_id: string;
    session_id: string;
}

interface StartNewUserMessageRequest {
    userMessage: string;
    stream: boolean;
}

interface AcceptFunctionCallRequest {
    accept: boolean;
    stream: boolean;
}

export type CommandCenterRequest = StartNewUserMessageRequest | AcceptFunctionCallRequest

export async function GET(req: NextRequest, { params }: { params: Params }) {
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

        }
        else if(sessionData.mode === "chat"){
            const {data: messages, error: messagesError} = await supabase
                .from('command_center_sessions_messages')
                .select('id, session_id, sender, content, created_at')
                .eq('session_id', session_id)
                .order('created_at', { ascending: true });

            if (messagesError) {
                console.error('Error fetching messages:', messagesError);
                return NextResponse.json({ error: "Database Error" }, { status: 500 });
            }

            if (!messages) {
                return NextResponse.json({ error: "No messages found" }, { status: 404 });
            }

            if(messages.length === 0){
                return await handleAiMessageLast(req, messages, supabase, session_id);
            }
            else {
                return handleUserMessageLast();
            }
        }
    }
    catch (error) {
        console.error('Error in POST:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function handleUserMessageLast(){
    return NextResponse.json({

    }, { status: 200 });
}

async function handleAiMessageLast(
    req: NextRequest,
    existingMessages: any[],
    supabase: SupabaseClient<any, "public", any>,
    sessionId: string
) {
    // MODIFICATION: Read userMessage from query params for EventSource
    const userMessageFromQuery = req.nextUrl.searchParams.get('userMessage');
    let userMessageFromBody: string | null = null;

    // Attempt to read from body for non-EventSource requests (e.g., testing with curl/Postman)
    // This part is tricky because req.json() consumes the body.
    // For a pure SSE GET endpoint, you'd typically only use query params.
    // If you need to support both POST with JSON and GET with query for the same endpoint,
    // it requires careful handling or separate endpoints.
    // For simplicity with EventSource, let's prioritize query params.

    if (req.method === 'POST') { // Or check content-type if you want to be more robust
        try {
            const body = await req.json();
            userMessageFromBody = body.userMessage;
        } catch (e) {
            // Ignore if body is not JSON or empty, rely on query param
            console.error("Failed to parse JSON body:", e);
        }
    }

    const userMessage = userMessageFromQuery || userMessageFromBody;


    if (!userMessage) {
        // If it was a GET request (EventSource) and no query param
        if (req.method === 'GET' && !userMessageFromQuery) {
            // For EventSource, it's better to let the stream open and send an error event
            // But for initial validation, a 400 is also an option if you don't want to start a stream.
            // Let's assume for now the utility function ensures userMessage is sent.
            // If not, the existing check below will catch it.
        }
        return NextResponse.json({ error: "User Message is missing" }, { status: 400 });
    }

    // 1. Save the user's message to the database first
    const { data: savedUserMessage, error: userMessageError } = await supabase
        .from('command_center_sessions_messages')
        .insert({
            content: userMessage,
            sender: 'user',
            session_id: sessionId,
        })
        .select('id, content, sender, created_at')
        .single();

    if (userMessageError) {
        console.error("Error saving user message:", userMessageError);
        return NextResponse.json({ error: "Failed to save user message" }, { status: 500 });
    }
    console.log("User message saved:", savedUserMessage); // savedUserMessage now contains the ID

    const messagesForAI = [
        { role: "system", content: getPrompt() },
        ...existingMessages.map((message: any) => ({
            role: message.sender === 'ai' ? 'assistant' : 'user',
            content: message.content
        })),
        { role: 'user', content: userMessage }
    ] as ChatCompletionMessageParam[];

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
        async start(controller) {
            // --- MODIFICATION START ---
            // 2. Send the saved user message (with its ID) to the client immediately
            if (savedUserMessage) {
                controller.enqueue(encoder.encode(`event: userMessageProcessed\ndata: ${JSON.stringify({ type: 'userMessageProcessed', message: savedUserMessage })}\n\n`));
            }
            // --- MODIFICATION END ---

            let completionStream: Stream<ChatCompletionChunk>;
            try {
                // 3. Call the AI (moved inside the stream's try-catch)
                completionStream = await agentClient.chat.completions.create({
                    messages: messagesForAI,
                    model: agentModelName,
                    temperature: 0,
                    stream: true,
                });
            } catch (aiError) {
                console.error("Error calling AI:", aiError);
                const errorMessage = aiError instanceof Error ? aiError.message : "Unknown AI error";
                controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "Failed to get response from AI: " + errorMessage })}\n\n`));
                controller.close(); // Close the stream on critical error
                return; // Exit the start function
            }

            let accumulatedAiContent = "";
            try {
                for await (const chunk of completionStream) {
                    const contentDelta = chunk.choices[0]?.delta?.content || "";
                    if (contentDelta) {
                        accumulatedAiContent += contentDelta;
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: contentDelta })}\n\n`));
                    }
                }

                if (accumulatedAiContent.trim()) {
                    const { data: savedAiMessage, error: aiMessageError } = await supabase
                        .from('command_center_sessions_messages')
                        .insert({
                            content: accumulatedAiContent.trim(),
                            sender: 'ai',
                            session_id: sessionId,
                        })
                        .select('id, content, sender, created_at')
                        .single();

                    if (aiMessageError) {
                        console.error("Error saving AI message:", aiMessageError);
                        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "Failed to save AI response" })}\n\n`));
                    } else if (savedAiMessage) {
                        console.log("AI message saved:", savedAiMessage);
                        controller.enqueue(encoder.encode(`event: AImessageSaved\ndata: ${JSON.stringify({ type: 'final', messageId: savedAiMessage.id, content: savedAiMessage.content })}\n\n`));
                    }
                } else {
                    controller.enqueue(encoder.encode(`event: AImessageEmpty\ndata: ${JSON.stringify({ type: 'final', message: "AI response was empty." })}\n\n`));
                }

            } catch (error) {
                console.error("Streaming or DB error:", error);
                let errorMessage = "An unexpected error occurred during streaming.";
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: errorMessage })}\n\n`));
            } finally {
                controller.close();
            }
        }
    });

    return new Response(readableStream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}