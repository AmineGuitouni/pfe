import OpenAI from 'openai';

export const openai = new OpenAI({
    baseURL: 'https://ai.guitouni-studio.online/v1',
    apiKey: process.env.OPENROUTER_KEY,
});