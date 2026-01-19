// src/app/api/cv_parcer/route.ts
import { NextResponse } from 'next/server';
import { prompt } from '@/lib/ai/prompts/cv_prompt';
import { getServerDBfromCompanyId } from '@/lib/database/externalServerSupabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { openai, providerOrder } from '@/lib/ai/openai';

// Models to try in order of preference (fallback chain)
const MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
];

// Helper function to call AI with retry and fallback
async function callAIWithFallback(cvPrompt: string, maxRetries = 2) {
  let lastError: any = null;
  
  for (const model of MODELS) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Trying model: ${model}, attempt: ${attempt + 1}`);
        
        const completion = await openai.chat.completions.create({
          model,
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
          temperature: 0.2,
          ...(providerOrder && { provider: { order: providerOrder } }),
        });
        
        // Check if we got a valid response
        if (completion?.choices?.[0]?.message?.content) {
          return { completion, model };
        }
        
        console.warn(`Empty response from ${model}, attempt ${attempt + 1}`);
      } catch (error: any) {
        lastError = error;
        console.error(`Error with ${model}, attempt ${attempt + 1}:`, error.message || error);
        
        // If it's a rate limit error (429), wait before retry
        if (error?.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }
  
  throw lastError || new Error('All AI models failed');
}

export async function POST(request: Request) {
  try {
    // 1. Authentication & Authorization
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (session.user.role !== "worker") {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    if (!session.user.company_id) {
      return NextResponse.json({ error: 'No company associated with user' }, { status: 400 });
    }

    // 2. Validate input
    const cvText = await request.text();
    if (!cvText || cvText.trim() === '') {
      return NextResponse.json({ error: 'CV text is required' }, { status: 400 });
    }

    // 3. AI Processing
    const cvPrompt = prompt(cvText);
    
    try {
      const { completion, model } = await callAIWithFallback(cvPrompt);
      console.log(`Successfully used model: ${model}`);

      const responseContent = completion.choices[0].message?.content;
      if (!responseContent) {
        console.error('No content in AI response');
        return NextResponse.json({ error: 'No content in AI response' }, { status: 502 });
      }

      // 4. Parse and validate AI response
      let parsedResponse;
      try {
        // Clean up response if needed
        let cleanedResponse = responseContent;
        
        // Remove markdown code blocks if present
        if (cleanedResponse.includes('```json')) {
          cleanedResponse = cleanedResponse.replace(/```json\s+/g, '').replace(/```\s*$/g, '');
        }
        
        // Remove any other markdown formatting
        cleanedResponse = cleanedResponse.replace(/```[a-z]*\s+/g, '').replace(/```\s*$/g, '');
          
        parsedResponse = JSON.parse(cleanedResponse);
        
        // Validate that we have parsed response
        if (!parsedResponse) {
          throw new Error('Failed to parse response as JSON');
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.error('Raw response was:', responseContent);
        return NextResponse.json({ 
          error: 'Invalid JSON response from AI',
          rawResponse: responseContent 
        }, { status: 422 });
      }

      // 5. Database operations
      const supabase = await getServerDBfromCompanyId(session.user.company_id);
      if (!supabase) {
        return NextResponse.json({ error: 'Failed to connect to database' }, { status: 503 });
      }
      
      const {data, error } = await supabase
        .from("cv_informations")
        .insert({
          user_id: session.user.id,
          certifications: parsedResponse.certifications || [],
          education: parsedResponse.education || [],
          languages: parsedResponse.languages || [],
          projects: parsedResponse.projects || [],
          recommendedTaskTypes: parsedResponse.recommendedTaskTypes || [],
          skills: parsedResponse.skills || [],
          summary: parsedResponse.summary || '',
          workExperience: parsedResponse.workExperience || [],
          strengths: parsedResponse.strengths || []
        })
        .select("id")
        .single();

        if (error) {
          console.error('Database error:', error);
          return NextResponse.json({ 
            error: 'Failed to save CV data',
            details: error.message
          }, { status: 500 });
        }

      const { error: userError } = await supabase
        .from("users")
        .update({ cv_informations: data.id })
        .eq('id', session.user.id);

      if(userError) {
        console.error('Database error:', userError);
        return NextResponse.json({
          error: 'Failed to update user data',
          details: userError.message
        }, { status: 500 });
      }

      // 6. Return success response
      return NextResponse.json({
        ok: true,
        message: 'CV successfully analyzed and saved',
        cv_informations_id: data.id
      }, { status: 200 });
    } catch (aiError: any) {
      console.error('AI service error:', aiError);
      return NextResponse.json({ 
        error: 'AI service error', 
        details: aiError.message 
      }, { status: 502 });
    }
  } catch (error: any) {
    console.error('Unhandled exception:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error.message 
    }, { status: 500 });
  }
}