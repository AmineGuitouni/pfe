import { SupabaseClient } from "@supabase/supabase-js";
import { ChatCompletionContentPart, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { getPrompt } from "../prompt";
import { tools } from "../tools/toolsDefinitions";
import { OpenAIToolCall, parseToolCalls } from "../tools/toolSchema";
import { getBase64Audio, saveBase64Audio } from "@/lib/utils/saveBase64Audio";

interface PrepareAgentMessagesParams {
    supabase: SupabaseClient<any, "public", any>;
    chat_session: string;
    acceptToolCall?: boolean;
    rejectToolCall?: boolean;
    userPrompt?: string;
    userAudioPrompt?: string; // Base64 audio data
    userId?: string;
    companyId?: string;
    pendingToolCalls?: OpenAIToolCall[]; // Tool calls from the last AI response that need to be executed
}

/**
 * Validates base64 audio data format
 * @param audioBase64 - Base64 encoded audio data
 * @returns Validation result with format information
 */
function validateAudioData(audioBase64: string) {
    if (!audioBase64 || typeof audioBase64 !== 'string') {
        throw new Error('Audio data must be a non-empty string');
    }

    const audioFormatRegex = /^data:audio\/([^;]+);base64,(.+)$/;
    const match = audioBase64.match(audioFormatRegex);

    if (!match) {
        throw new Error('Invalid audio format. Expected format: data:audio/[type];base64,[data]');
    }

    const format = match[1];
    const base64Data = match[2];

    if (!base64Data) {
        throw new Error('No base64 data found in audio string');
    }

    return { format, base64Data };
}

export async function prepareAgentMessages({supabase, chat_session, userPrompt, userAudioPrompt, rejectToolCall, acceptToolCall, companyId, userId, pendingToolCalls}:PrepareAgentMessagesParams){
    // First try with new columns, fall back to old columns if they don't exist
    let data: any[] | null = null;
    let error: any = null;

    // Try fetching with new tool-related columns
    const resultWithNewCols = await supabase
        .from('command_center_sessions_messages')
        .select('id, session_id, sender, content, created_at, content_type, storage_path, tool_calls, tool_call_id, tool_name')
        .eq('session_id', chat_session)
        .order('created_at', { ascending: true });

    if (resultWithNewCols.error?.code === '42703') {
        // Column doesn't exist - fall back to old schema
        console.log('New tool columns not found, using legacy schema');
        const resultLegacy = await supabase
            .from('command_center_sessions_messages')
            .select('id, session_id, sender, content, created_at, content_type, storage_path')
            .eq('session_id', chat_session)
            .order('created_at', { ascending: true });
        
        data = resultLegacy.data;
        error = resultLegacy.error;
    } else {
        data = resultWithNewCols.data;
        error = resultWithNewCols.error;
    }

    if (error) {
        console.error("Error fetching messages:", error);
        console.log("About to throw error: Failed to fetch messages");
        throw new Error("Failed to fetch messages");
    }

    const messagePromises = data.map(async (message: any) => {
        // Determine the role based on sender
        let role: 'assistant' | 'user' | 'tool';
        if (message.sender === 'ai') {
            role = 'assistant';
        } else if (message.sender === 'tool') {
            role = 'tool';
        } else {
            role = 'user';
        }
        
        let content: ChatCompletionContentPart | string;
        
        if(message.content_type === 'text'){
            content = message.content
        } else if(message.content_type === 'audio'){
            const audioData = await getBase64Audio(supabase, 'chat', message.storage_path);
            content = {
                type: 'input_audio',
                input_audio: {
                    data: audioData.base64Data?.split(',')[1] || "",
                    format: audioData.mimeType?.split('/')[1] as "wav" | "mp3" || "wav",
                }
            };
        } else {
            console.warn(`Unknown content type: ${message.content_type}`);
            content = {
                type: 'text',
                text: "Unsupported content type received."
            };
        }

        // Handle assistant messages with tool_calls
        if (role === 'assistant' && message.tool_calls) {
            const toolCallsData = typeof message.tool_calls === 'string' 
                ? JSON.parse(message.tool_calls) 
                : message.tool_calls;
            
            return {
                role,
                content: content instanceof Object ? null : (content || null),
                tool_calls: toolCallsData,
            };
        }

        // Handle tool result messages
        if (role === 'tool' && message.tool_call_id) {
            return {
                role,
                tool_call_id: message.tool_call_id,
                content: content instanceof Object ? JSON.stringify(content) : content,
            };
        }

        return {
            role,
            content: content instanceof Object ? [content] : content,
        };
    });

    const resolvedMessages = await Promise.all(messagePromises);
    
    const messagesHistory = [
        { role: "system", content: getPrompt({company_id:companyId, user_id:userId}) },
        ...resolvedMessages,
    ] as ChatCompletionMessageParam[];

    if(messagesHistory.length === 1 && !userPrompt && !userAudioPrompt){
        console.log("About to throw error: No messages found in the session and no user prompt provided.");
        throw new Error("No messages found in the session and no user prompt provided.");
    }
    else if(messagesHistory.length === 1 && (userPrompt || userAudioPrompt)){
        if (userPrompt) {
            messagesHistory.push({ role: "user", content: userPrompt });
            const savedMessage = await SaveMessage(supabase, chat_session, 'user', userPrompt);
            return {messagesHistory, savedMessage};
        } else if (userAudioPrompt) {
            const audioContent = createAudioContent(userAudioPrompt);
            messagesHistory.push({ role: "user", content: [audioContent] });
            const savedMessage = await SaveMessage(supabase, chat_session, 'user', 'Audio message', 'audio', userAudioPrompt);
            return {messagesHistory, savedMessage};
        }
    }

    const lastMessage = messagesHistory[messagesHistory.length - 1];
    if(lastMessage.role === 'assistant'){
        if(userPrompt || userAudioPrompt){
            if (userPrompt) {
                messagesHistory.push({ role: "user", content: userPrompt });
                const savedMessage = await SaveMessage(supabase, chat_session, 'user', userPrompt);
                return {messagesHistory, savedMessage};
            } else if (userAudioPrompt) {
                const audioContent = createAudioContent(userAudioPrompt);
                messagesHistory.push({ role: "user", content: [audioContent] });
                const savedMessage = await SaveMessage(supabase, chat_session, 'user', 'Audio message', 'audio', userAudioPrompt);
                return {messagesHistory, savedMessage};
            }
        }
        
        // Check if the last assistant message has tool_calls (from OpenAI tool calling)
        const lastAssistantMsg = lastMessage as any;
        if (!lastAssistantMsg.tool_calls || lastAssistantMsg.tool_calls.length === 0) {
            // No tool calls pending - this is a normal message, continue conversation
            return {messagesHistory, savedMessage: null};
        }

        const toolCalls = lastAssistantMsg.tool_calls as OpenAIToolCall[];
        
        if(rejectToolCall){
            // Add rejection messages for all tool calls using OpenAI tool message format
            const toolResultMessages: ChatCompletionMessageParam[] = [];
            for (const toolCall of toolCalls) {
                const rejectMessage: ChatCompletionMessageParam = {
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({
                        success: false,
                        error: "Tool call rejected by user. Continue conversation without using tools."
                    })
                };
                toolResultMessages.push(rejectMessage);
                await SaveToolResultMessage(supabase, chat_session, toolCall.id, toolCall.function.name, {
                    success: false,
                    error: "Tool call rejected by user"
                });
            }
            messagesHistory.push(...toolResultMessages);
            return {messagesHistory, savedMessage: null};
        }

        if(acceptToolCall){
            // Execute all tool calls and add results using OpenAI tool message format
            const toolResultMessages: ChatCompletionMessageParam[] = [];
            const parsedToolCalls = parseToolCalls(toolCalls);

            for (const parsedCall of parsedToolCalls) {
                const toolToCall = tools[parsedCall.name];
                
                if(!toolToCall){
                    const errorResult = {
                        success: false,
                        error: `The tool ${parsedCall.name} is not available. Please use a different tool or continue the conversation without using any tools.`
                    };
                    const errorMessage: ChatCompletionMessageParam = {
                        role: "tool",
                        tool_call_id: parsedCall.id,
                        content: JSON.stringify(errorResult)
                    };
                    toolResultMessages.push(errorMessage);
                    await SaveToolResultMessage(supabase, chat_session, parsedCall.id, parsedCall.name, errorResult);
                    continue;
                }

                // Execute the tool with parsed arguments
                const toolCallOutput = await toolToCall(parsedCall.arguments);
                const resultMessage: ChatCompletionMessageParam = {
                    role: "tool",
                    tool_call_id: parsedCall.id,
                    content: JSON.stringify(toolCallOutput)
                };
                toolResultMessages.push(resultMessage);
                await SaveToolResultMessage(supabase, chat_session, parsedCall.id, parsedCall.name, toolCallOutput);
            }

            messagesHistory.push(...toolResultMessages);
            return {messagesHistory, savedMessage: null};
        }
        
        console.log("About to throw error: No acceptToolCall or rejectToolCall flag provided for pending tool calls.");
        throw new Error("No acceptToolCall or rejectToolCall flag provided for pending tool calls.");
    }
    
    return {messagesHistory, savedMessage: null}
}

export async function SaveMessage(
    supabase: SupabaseClient<any, "public", any>,
    session_id: string,
    sender: 'user' | 'ai' | 'tool',
    message: string,
    contentType: 'text' | 'audio' = 'text',
    base64AudioData?: string,
    toolCalls?: OpenAIToolCall[]
){
    let content = message;
    let storagePath: string | null = null;

    // Handle audio messages
    if (contentType === 'audio' && base64AudioData) {
        const { format } = validateAudioData(base64AudioData);
        
        // Save audio to storage
        const audioResult = await saveBase64Audio({
            base64Data: base64AudioData,
            supabase,
            bucketName: process.env.SUPABASE_PRIVATE_BUCKET || 'private-bucket',
            folderName: session_id,
            fileName: `audio_${crypto.randomUUID()}.${format}`
        });

        if (!audioResult.success) {
            console.error('Error saving audio to storage:', audioResult.error);
            throw new Error(`Failed to save audio: ${audioResult.error}`);
        }

        storagePath = audioResult.path!;
        content = audioResult.url || "";
    }

    const { data: savedMessage, error: messageError } = await supabase
        .from('command_center_sessions_messages')
        .insert({
            session_id: session_id,
            sender: sender,
            content: content,
            content_type: contentType,
            storage_path: storagePath,
            created_at: new Date().toISOString()
        })
        .select('id')
        .single();

    // If new columns exist and we have tool calls, update the message with tool_calls
    if (!messageError && toolCalls && toolCalls.length > 0) {
        try {
            await supabase
                .from('command_center_sessions_messages')
                .update({ tool_calls: JSON.stringify(toolCalls) })
                .eq('id', savedMessage.id);
        } catch (e) {
            // Column might not exist yet, ignore silently
            console.log('Could not save tool_calls (column may not exist):', e);
        }
    }

    if (messageError) {
        console.error('Error saving last message:', messageError);
        console.log("About to throw messageError:", messageError);
        throw messageError;
    }

    return {
        id: savedMessage.id,
        session_id: session_id,
        sender: sender,
        content: content,
        content_type: contentType,
        storage_path: storagePath,
        tool_calls: toolCalls || null,
        created_at: new Date().toISOString()
    }
}

/**
 * Save a tool result message to the database (for OpenAI tool calling format)
 * Falls back to legacy format if new columns don't exist
 */
export async function SaveToolResultMessage(
    supabase: SupabaseClient<any, "public", any>,
    session_id: string,
    tool_call_id: string,
    tool_name: string,
    result: any
) {
    // First try to insert with new columns
    let savedMessage: any = null;
    let messageError: any = null;

    const resultWithNewCols = await supabase
        .from('command_center_sessions_messages')
        .insert({
            session_id: session_id,
            sender: 'tool',
            content: JSON.stringify(result),
            content_type: 'text',
            tool_call_id: tool_call_id,
            tool_name: tool_name,
            created_at: new Date().toISOString()
        })
        .select('id')
        .single();

    if (resultWithNewCols.error?.code === '42703') {
        // Column doesn't exist - fall back to legacy format
        console.log('New tool columns not found for insert, using legacy format');
        const legacyContent = "```tool_result\n" + JSON.stringify({
            name: tool_name,
            output: result,
        }) + "\n```";
        
        const resultLegacy = await supabase
            .from('command_center_sessions_messages')
            .insert({
                session_id: session_id,
                sender: 'tool',
                content: legacyContent,
                content_type: 'text',
                created_at: new Date().toISOString()
            })
            .select('id')
            .single();
        
        savedMessage = resultLegacy.data;
        messageError = resultLegacy.error;
    } else {
        savedMessage = resultWithNewCols.data;
        messageError = resultWithNewCols.error;
    }

    if (messageError) {
        console.error('Error saving tool result message:', messageError);
        throw messageError;
    }

    return savedMessage;
}

/**
 * Helper function to create audio content for chat messages
 * @param base64AudioData - Base64 encoded audio data (e.g., "data:audio/webm;base64,GkXfo59ChoEBQveBAUL...")
 * @returns ChatCompletionContentPart for audio input
 */
export function createAudioContent(base64AudioData: string): ChatCompletionContentPart {
    const { format, base64Data } = validateAudioData(base64AudioData);

    return {
        type: 'input_audio',
        input_audio: {
            data: base64Data,
            format: format === 'mp3' ? 'mp3' as const : 'wav' as const
        }
    };
}

/**
 * Helper function to save audio message and return the saved message data
 * @param supabase - Supabase client
 * @param chat_session - Chat session ID
 * @param base64AudioData - Base64 encoded audio data
 * @returns Saved message data
 */
export async function saveAudioMessage(
    supabase: SupabaseClient<any, "public", any>,
    chat_session: string,
    base64AudioData: string
) {
    return await SaveMessage(supabase, chat_session, 'user', 'Audio message', 'audio', base64AudioData);
}