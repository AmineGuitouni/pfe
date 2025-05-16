import OpenAI from 'openai';

export const openai = new OpenAI({
    baseURL: 'https://ai.guitouni-studio.online/v1',
    apiKey: process.env.OPENROUTER_KEY,
});

export const agentModelName = 'qwen/qwen3-235b-a22b:free'

export const agentClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_KEY_2,
});