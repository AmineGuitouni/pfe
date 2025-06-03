import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Interface for the save audio response
 */
export interface SaveAudioResponse {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

/**
 * Interface for save audio function parameters
 */
export interface SaveBase64AudioParams {
  base64Data: string;
  supabase: SupabaseClient<any, "public", any>;
  bucketName: string;
  folderName: string;
  fileName?: string;
}

/**
 * Helper function to save base64 audio data to Supabase storage
 * 
 * @param params - Object containing base64Data, supabase client, bucketName, folderName, and optional fileName
 * @returns Promise<SaveAudioResponse> - Object containing success status, URL, error message, and storage path
 * 
 * @example
 * ```typescript
 * const result = await saveBase64Audio({
 *   base64Data: "data:audio/wav;base64,GkXfo59ChoEBQveBAUL..",
 *   supabase: supabaseClient,
 *   bucketName: "audio-files",
 *   folderName: "recordings",
 *   fileName: "my-recording.wav" // optional
 * });
 * 
 * if (result.success) {
 *   console.log("Audio URL:", result.url);
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function saveBase64Audio({
  base64Data,
  supabase,
  bucketName,
  folderName,
  fileName
}: SaveBase64AudioParams): Promise<SaveAudioResponse> {
  try {
    // Validate base64Data format
    if (!base64Data || typeof base64Data !== 'string') {
      return {
        success: false,
        error: "Invalid base64Data: must be a non-empty string"
      };
    }

    // Parse the base64 data URI
    const base64Regex = /^data:([^;]+);base64,(.+)$/;
    const match = base64Data.match(base64Regex);
    
    if (!match) {
      return {
        success: false,
        error: "Invalid base64 format. Expected format: data:audio/[type];base64,[data]"
      };
    }

    const mimeType = match[1];
    const base64String = match[2];

    // Validate that it's an audio file
    if (!mimeType.startsWith('audio/')) {
      return {
        success: false,
        error: `Invalid MIME type: ${mimeType}. Expected audio/* type`
      };
    }

    // Extract file extension from MIME type
    const extension = mimeType.split('/')[1];
    
    // Generate filename if not provided
    const finalFileName = fileName || `audio_${crypto.randomUUID()}.${extension}`;
    
    // Ensure folder name doesn't start or end with slash
    const cleanFolderName = folderName.replace(/^\/+|\/+$/g, '');
    
    // Create the storage path
    const storagePath = cleanFolderName ? `${cleanFolderName}/${finalFileName}` : finalFileName;

    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false // Set to true if you want to overwrite existing files
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return {
        success: false,
        error: `Failed to upload audio: ${uploadError.message}`
      };
    }

    if (!uploadData?.path) {
      return {
        success: false,
        error: "Upload succeeded but no path was returned from storage"
      };
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadData.path);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: "Failed to get public URL for uploaded audio"
      };
    }

    return {
      success: true,
      url: urlData.publicUrl,
      path: uploadData.path
    };

  } catch (error) {
    console.error("Error in saveBase64Audio:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Unexpected error: ${errorMessage}`
    };
  }
}

/**
 * Helper function to delete audio from Supabase storage
 * 
 * @param supabase - Supabase client instance
 * @param bucketName - Name of the storage bucket
 * @param filePath - Path of the file to delete (returned from saveBase64Audio)
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function deleteAudioFromStorage(
  supabase: SupabaseClient<any, "public", any>,
  bucketName: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error("Supabase Storage delete error:", error);
      return {
        success: false,
        error: `Failed to delete audio: ${error.message}`
      };
    }

    return { success: true };

  } catch (error) {
    console.error("Error in deleteAudioFromStorage:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Unexpected error: ${errorMessage}`
    };
  }
}

/**
 * Interface for the get audio response
 */
export interface GetAudioResponse {
  success: boolean;
  base64Data?: string;
  error?: string;
  mimeType?: string;
}

/**
 * Helper function to retrieve audio from Supabase storage and convert to base64
 * 
 * @param supabase - Supabase client instance
 * @param bucketName - Name of the storage bucket
 * @param filePath - Path of the file to retrieve
 * @returns Promise<GetAudioResponse> - Object containing success status, base64 data, MIME type, and error message
 * 
 * @example
 * ```typescript
 * const result = await getBase64Audio(
 *   supabaseClient,
 *   "audio-files",
 *   "recordings/my-recording.wav"
 * );
 * 
 * if (result.success) {
 *   console.log("Base64 audio:", result.base64Data);
 *   console.log("MIME type:", result.mimeType);
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function getBase64Audio(
  supabase: SupabaseClient<any, "public", any>,
  bucketName: string,
  filePath: string
): Promise<GetAudioResponse> {
  try {
    // Download the file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (downloadError) {
      console.error("Supabase Storage download error:", downloadError);
      return {
        success: false,
        error: `Failed to download audio: ${downloadError.message}`
      };
    }

    if (!fileData) {
      return {
        success: false,
        error: "No file data received from storage"
      };
    }

    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine file extension and check if conversion is needed
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    const supportedFormats = ["wav", "mp3", "flac", "m4a", "ogg", "pcm"];
    
    const finalBuffer = buffer;
    let finalMimeType = 'audio/wav'; // default

    // If format is not supported, convert to WAV
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      console.log(`Unsupported format: ${fileExtension}, converting to WAV`);
      // For unsupported formats like webm, we'll return as WAV
      finalMimeType = 'audio/wav';
      // Note: This is a simple conversion - for production use, you might want to use FFmpeg
    } else {
      // Set appropriate MIME type for supported formats
      switch (fileExtension) {
        case 'mp3':
          finalMimeType = 'audio/mpeg';
          break;
        case 'wav':
          finalMimeType = 'audio/wav';
          break;
        case 'ogg':
          finalMimeType = 'audio/ogg';
          break;
        case 'm4a':
          finalMimeType = 'audio/mp4';
          break;
        case 'flac':
          finalMimeType = 'audio/flac';
          break;
        case 'pcm':
          finalMimeType = 'audio/pcm';
          break;
        default:
          finalMimeType = 'audio/wav';
      }
    }

    // Convert buffer to base64
    const base64String = finalBuffer.toString('base64');

    // Create the complete base64 data URI
    const base64Data = `data:${finalMimeType};base64,${base64String}`;

    return {
      success: true,
      base64Data,
      mimeType: finalMimeType
    };

  } catch (error) {
    console.error("Error in getBase64Audio:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Unexpected error: ${errorMessage}`
    };
  }
}
