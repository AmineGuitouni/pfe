import { SupabaseClient } from "@supabase/supabase-js";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { getPrompt } from "../prompt";
import { tools } from "../tools/toolsDefinitions";
import { parseMessageWithToolUse } from "./parseToolFromAiRes";

interface PrepareAgentMessagesParams {
    supabase: SupabaseClient<any, "public", any>;
    chat_session: string;
    acceptToolCall?: boolean;
    rejectToolCall?: boolean;
    userPrompt?: string;
    userId?: string;
    companyId?: string;
}

export async function prepareAgentMessages({supabase, chat_session, userPrompt, rejectToolCall, acceptToolCall, companyId, userId}:PrepareAgentMessagesParams){
    const {data, error} = await supabase
    .from('command_center_sessions_messages')
    .select('id, session_id, sender, content, created_at')
    .eq('session_id', chat_session)
    .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        console.log("About to throw error: Failed to fetch messages");
        throw new Error("Failed to fetch messages");
    }

    const messagesHistory = [
        { role: "system", content: getPrompt({company_id:companyId, user_id:userId}) },
        ...data.map((message: any) => ({
            role: message.sender === 'ai' ? 'assistant' : 'user',
            content: message.content
        })),
    ] as ChatCompletionMessageParam[];

    if(messagesHistory.length === 1 && !userPrompt){
        console.log("About to throw error: No messages found in the session and no user prompt provided.");
        throw new Error("No messages found in the session and no user prompt provided.");
    }
    else if(messagesHistory.length === 1 && userPrompt){
        messagesHistory.push({ role: "user", content: userPrompt });
        const savedMessage = await SaveMessage(supabase, chat_session, 'user', userPrompt);
        return {messagesHistory, savedMessage};
    }

    const lastMessage = messagesHistory[messagesHistory.length - 1];
    if(lastMessage.role === 'assistant'){
        if(userPrompt){
            messagesHistory.push({ role: "user", content: userPrompt });
            const savedMessage = await SaveMessage(supabase, chat_session, 'user', userPrompt);
            return {messagesHistory, savedMessage};
        }
        
        const lastContent = lastMessage.content as string
        const tool = parseMessageWithToolUse(lastContent);
        if(!tool){
            console.log("About to throw error: No tool call found in the last assistant message.");
            throw new Error("No tool call found in the last assistant message.");
        }

        console.log("Tool call detected:", tool);
        
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
    message: string
){
    const { data: savedMessage, error: messageError } = await supabase
        .from('command_center_sessions_messages')
        .insert({
            session_id: session_id,
            sender: sender,
            content: message,
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
        content: message,
        created_at: new Date().toISOString()
    }
}