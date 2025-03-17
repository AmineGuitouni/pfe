// src/app/api/analyze-cv/route.ts
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
    // Get text directly from request body as text
    const cvText = await request.text();

    console.log('Received CV text:', cvText);

    if (!cvText || cvText.trim() === '') {
      return NextResponse.json({ error: 'CV text is required' }, { status: 400 });
    }

    const cvPrompt: string = prompt(cvText);

    const completion = await openai.chat.completions.create({
      model: 'google/gemma-3-27b-it:free',
      messages: [
        {
          role: 'system',
          content: 'You are an expert CV analyzer and talent matcher. Extract structured data from CVs and identify suitable task types. Your response must be ONLY a valid JSON object without any markdown formatting, code blocks, or explanatory text.'
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
    
    // Clean up the response content before parsing
    let cleanedResponse = responseContent;
    
    // Remove markdown code blocks if present
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\s+/g, '').replace(/```\s*$/g, '');
    }
    
    // Remove any other markdown formatting
    cleanedResponse = cleanedResponse.replace(/```[a-z]*\s+/g, '').replace(/```\s*$/g, '');  
    
    try {
      const parsedResponse = JSON.parse(cleanedResponse);
      return NextResponse.json(parsedResponse);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response was:', responseContent);
      return NextResponse.json({ 
        error: 'Invalid JSON response from AI',
        rawResponse: responseContent 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return NextResponse.json({ error: 'Failed to analyze CV' }, { status: 500 });
  }
}