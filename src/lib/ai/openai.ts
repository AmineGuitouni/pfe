import OpenAI from 'openai';

export const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_KEY,
});

export const AiModelName = process.env.AI_MODEL_NAME || 'xiaomi/mimo-v2-flash:free';

export const providerOrder = process.env.PROVIDER_ORDER
    ? process.env.PROVIDER_ORDER.split(',').map(p => p.trim())
    : undefined;