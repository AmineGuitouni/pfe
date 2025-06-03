import { SupabaseClient } from "@supabase/supabase-js";
import { ChatCompletionContentPart, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { getPrompt } from "../prompt";
import { tools } from "../tools/toolsDefinitions";
import { parseMessageWithToolUse } from "./parseToolFromAiRes";
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

export async function prepareAgentMessages({supabase, chat_session, userPrompt, userAudioPrompt, rejectToolCall, acceptToolCall, companyId, userId}:PrepareAgentMessagesParams){
    const {data, error} = await supabase
    .from('command_center_sessions_messages')
    .select('id, session_id, sender, content, created_at, content_type, storage_path')
    .eq('session_id', chat_session)
    .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        console.log("About to throw error: Failed to fetch messages");
        throw new Error("Failed to fetch messages");
    }

    const messagePromises = data.map(async (message: any) => {
        const role = message.sender === 'ai' ? 'assistant' : 'user'
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
        
        const lastContent = lastMessage.content as string
        const tool = parseMessageWithToolUse(lastContent);
        if(!tool){
            console.log("About to throw error: No tool call found in the last assistant message.");
            throw new Error("No tool call found in the last assistant message.");
        }
        
        if(rejectToolCall){
            const content = "```tool_result\n" + JSON.stringify({
                    name: tool.name,
                    output: "Tool call rejected by user. Continue conversation without using tools.",
                }) + "\n```"
            messagesHistory.push({
                role: "user",
                content: content
            });

            const savedMessage = await SaveMessage(supabase, chat_session, 'tool', content);
            return {messagesHistory, savedMessage};
        }

        if(acceptToolCall){
            const toolToCall = tools[tool.name];
            if(!toolToCall){
                const content = "```tool_result\n" + JSON.stringify({
                    name: tool.name,
                    output: `The tool ${tool.name} is not available. Please use a different tool or continue the conversation without using any tools.`,
                }) + "\n```"
                messagesHistory.push({
                    role: "user",
                    content: content
                });
                
                const savedMessage = await SaveMessage(supabase, chat_session, 'tool', content);
                return {messagesHistory, savedMessage};
            }

            // Extract parameter values from the nested structure
            const extractedParams: Record<string, any> = {};
            if (tool.parameters) {
                for (const [key, param] of Object.entries(tool.parameters)) {
                    if (typeof param === 'object' && param !== null && 'value' in param) {
                        extractedParams[key] = param.value;
                    } else {
                        extractedParams[key] = param;
                    }
                }
            }

            const toolCallOutput = await toolToCall(extractedParams);
            const content = "```tool_result\n" + JSON.stringify({
                name: tool.name,
                output: toolCallOutput,
            }) + "\n```"
            messagesHistory.push({
                role: "user",
                content: content
            });

            const savedMessage = await SaveMessage(supabase, chat_session, 'tool', content);
            return {messagesHistory, savedMessage};
        }
        
        console.log("About to throw error: No acceptToolCall or rejectToolCall flag provided for the last assistant message.");
        throw new Error("No acceptToolCall or rejectToolCall flag provided for the last assistant message.");
    }
    
    return {messagesHistory, savedMessage: null}
}

export async function SaveMessage(
    supabase: SupabaseClient<any, "public", any>,
    session_id: string,
    sender: 'user' | 'ai' | 'tool',
    message: string,
    contentType: 'text' | 'audio' = 'text',
    base64AudioData?: string
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
            bucketName: 'chat',
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
        created_at: new Date().toISOString()
    }
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