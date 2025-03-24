import { openai } from '@/lib/ai/openai';
import { projectTasksPrompt } from '@/lib/ai/prompts/cv_prompt';
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  try {
    const { projectName, projectDescription } = await req.json();

    if (!projectName || !projectDescription) {
      return new NextResponse(
        JSON.stringify({ error: 'Project name and description are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const prompt = projectTasksPrompt(projectName, projectDescription);
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: [{
        type:"text",
        text:prompt
      }]}],
      model: 'gemini-2.0-flash',
      response_format: { type: 'json_object' },
    });

    const generatedTasks = completion.choices[0].message.content;
    const jsonTasks = generatedTasks ? JSON.parse(generatedTasks?.replace("```json", '').replace("```", '')) : []
    
    return NextResponse.json({data:jsonTasks}, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error generating tasks:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}