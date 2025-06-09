import { SupabaseClient } from "@supabase/supabase-js";
import { saveBase64Audio } from "@/lib/utils/saveBase64Audio";

interface TTSResponse {
  sample_rate: number;
  duration_seconds: number;
  audio_base64: string;
}

interface GenerateAudioOptions {
  baseUrl: string;
  text: string;
  supabase: SupabaseClient<any, "public", any>;
  bucketName: string;
  folderName: string;
  voice?: string;
  speed?: number;
  [key: string]: any; // Allow additional payload parameters
}

/**
 * Generates audio from text using TTS API and saves it to Supabase storage
 * @param options - Configuration options including baseUrl, text, supabase client, bucket and folder info, and optional parameters
 * @returns Promise<string> - Public URL of the saved audio file
 * @throws Error if the API request fails or file upload fails
 */
export async function generateAIAudio(options: GenerateAudioOptions): Promise<string> {
  const { baseUrl, text, supabase, bucketName, folderName, ...additionalParams } = options;
  
  // Prepare the payload
  const payload = {
    text,
    return_file: false, // We want JSON response with base64
    ...additionalParams
  };

  try {
    const response = await fetch(`${baseUrl}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TTS API error (${response.status}): ${errorText}`);
    }

    const data: TTSResponse = await response.json();
    
    if (!data.audio_base64) {
      throw new Error('No audio_base64 found in response');
    }

    // Convert base64 to data URI format if not already
    const base64AudioData = data.audio_base64.startsWith('data:') 
      ? data.audio_base64 
      : `data:audio/wav;base64,${data.audio_base64}`;

    // Save audio to Supabase storage
    const saveResult = await saveBase64Audio({
      base64Data: base64AudioData,
      supabase,
      bucketName,
      folderName,
      fileName: `ai_audio_${crypto.randomUUID()}.wav`
    });

    if (!saveResult.success) {
      throw new Error(`Failed to save audio to storage: ${saveResult.error}`);
    }

    if (!saveResult.url) {
      throw new Error('Audio saved but no URL returned');
    }

    return saveResult.url;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate audio: ${error.message}`);
    }
    throw new Error('Failed to generate audio: Unknown error');
  }
}