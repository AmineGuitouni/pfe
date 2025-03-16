// Create a new file: src/app/api/analyze-cv/route.ts

import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { prompt } from '@/lib/ai/prompts/cv_prompt';

// Server-side environment variables are secure
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { cvText } = await request.json();

    if (!cvText || cvText.trim() === '') {
      return NextResponse.json({ error: 'CV text is required' }, { status: 400 });
    }

    const cvPrompt : string = prompt(cvText);

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert CV analyzer and talent matcher. Extract structured data from CVs and identify suitable task types. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: cvPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      return NextResponse.json({ error: 'No response received from AI' }, { status: 500 });
    }
    
    const parsedResponse = JSON.parse(responseContent);
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return NextResponse.json({ error: 'Failed to analyze CV' }, { status: 500 });
  }
}

