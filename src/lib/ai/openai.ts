import OpenAI from 'openai';

export const openai = new OpenAI({
    baseURL: 'https://ai.guitouni-studio.online/v1',
    apiKey: process.env.OPENROUTER_KEY,
});

export const agentModelName = 'gemini-2.5-flash-preview-05-20';

export const agentClient = new OpenAI({
    baseURL: 'https://ai.guitouni-studio.online/v1',
    apiKey: process.env.OPENROUTER_KEY,
});
// new OpenAI({
//     baseURL: "https://openrouter.ai/api/v1",
//     apiKey: process.env.OPENROUTER_KEY_2,
// });