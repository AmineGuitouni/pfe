import { openai, AiModelName, providerOrder } from '@/lib/ai/openai';
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
      model: AiModelName,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'project_tasks',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              tasks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    dependencies: { 
                      type: 'array',
                      items: { type: 'string' }
                    },
                    difficultyLevel: { type: 'number' }
                  },
                  required: ['title', 'description', 'dependencies', 'difficultyLevel'],
                  additionalProperties: false
                }
              }
            },
            required: ['tasks'],
            additionalProperties: false
          }
        }
      },
      ...(providerOrder && { provider: { order: providerOrder } }),
    } as any);

    const generatedTasks = completion.choices[0].message.content;
    let jsonTasks = [];
    
    if (generatedTasks) {
      try {
        // Find the JSON object within the response (handles markdown or extra text)
        const startIndex = generatedTasks.indexOf('{');
        const endIndex = generatedTasks.lastIndexOf('}');
        
        if (startIndex !== -1 && endIndex !== -1) {
          const jsonString = generatedTasks.substring(startIndex, endIndex + 1);
          const parsed = JSON.parse(jsonString);
          jsonTasks = parsed.tasks || [];
        }
      } catch (error) {
        console.error('Failed to parse generated tasks JSON:', error);
        // Fallback to empty array
      }
    }
    console.log(jsonTasks)
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