import { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/index.mjs";
import { openai, AiModelName, providerOrder } from "../../openai";
import { agentTools, OpenAIToolCall } from "../tools/toolSchema";

interface AgentResponseGenerationParams {
    model?: string;
    messages: ChatCompletionMessageParam[];
    temperature?: number;
    enableTools?: boolean;
}

export interface AgentGenerationResult {
    content: string | null;
    toolCalls: OpenAIToolCall[] | null;
}

export async function agentResponseGeneration({
    model = AiModelName,
    messages,
    temperature = 0.0,
    enableTools = true,
}: AgentResponseGenerationParams): Promise<AgentGenerationResult> {
    try {
        // Make the API call with tool calling support
        const response = await openai.chat.completions.create({
            messages: messages,
            model: model,
            temperature: temperature,
            stream: false,
            ...(enableTools && { tools: agentTools, tool_choice: "auto" }),
            ...(providerOrder && { provider: { order: providerOrder } }),
        });

        const message = response.choices[0]?.message;
        const content = message?.content || null;
        
        // Extract tool calls if present
        let toolCalls: OpenAIToolCall[] | null = null;
        if (message?.tool_calls && message.tool_calls.length > 0) {
            toolCalls = message.tool_calls.map((tc: ChatCompletionMessageToolCall) => ({
                id: tc.id,
                type: tc.type as "function",
                function: {
                    name: tc.function.name,
                    arguments: tc.function.arguments
                }
            }));
        }

        return { content, toolCalls };
    } catch (error) {
        console.error('Error in agent response generation:', error);
        throw error;
    }
}