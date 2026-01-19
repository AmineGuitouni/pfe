import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { openai, AiModelName, providerOrder } from "../../openai";

interface AgentResponseGenerationParams {
    model?: string;
    messages: ChatCompletionMessageParam[];
    temperature?: number;
}

export async function agentResponseGeneration({
    model = AiModelName,
    messages,
    temperature = 0.0,
}: AgentResponseGenerationParams) {
    try {
        // Make the API call without streaming
        const response = await openai.chat.completions.create({
            messages: messages,
            model: model,
            temperature: temperature,
            stream: false,
            ...(providerOrder && { provider: { order: providerOrder } }),
        });

        const fullContent = response.choices[0]?.message?.content || '';

        return fullContent;
    } catch (error) {
        console.error('Error in agent response generation:', error);
        throw error;
    }
}