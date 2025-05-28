import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { agentClient, agentModelName } from "../../openai";

interface AgentResponseGenerationParams {
    model?: string;
    messages: ChatCompletionMessageParam[];
    temperature?: number;
}

export async function agentResponseGeneration({
    model = agentModelName,
    messages,
    temperature = 0.0,
}: AgentResponseGenerationParams) {
    try {
        // Make the API call without streaming
        const response = await agentClient.chat.completions.create({
            messages: messages,
            model: model,
            temperature: temperature,
            stream: false,
        });

        const fullContent = response.choices[0]?.message?.content || '';

        return fullContent;
    } catch (error) {
        console.error('Error in agent response generation:', error);
        throw error;
    }
}