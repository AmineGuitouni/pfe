/**
 * Audio utility functions for handling URL and base64 audio content
 */

/**
 * Detects if content is base64 audio data
 */
export const isBase64Audio = (content: string): boolean => {
  if (!content || typeof content !== 'string') {
    return false;
  }
  
  // Check for base64 audio data URI pattern - more permissive
  const base64AudioRegex = /^data:audio\/[^;]+;base64,/i;
  return base64AudioRegex.test(content);
};

/**
 * Converts base64 audio data to blob URL
 */
export const convertBase64ToBlob = (base64Data: string): string => {
  try {
    // Validate input
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Invalid base64Data: must be a non-empty string');
    }

    // Extract the base64 data and mime type
    const parts = base64Data.split(',');
    if (parts.length !== 2) {
      throw new Error('Invalid base64 format: missing comma separator');
    }

    const [mimeTypePart, base64String] = parts;
    const mimeTypeMatch = mimeTypePart.match(/data:([^;]+)/);
    
    if (!mimeTypeMatch) {
      throw new Error('Invalid base64 format: missing MIME type');
    }

    const mimeType = mimeTypeMatch[1];
    
    // Validate that it's an audio MIME type
    if (!mimeType.startsWith('audio/')) {
      throw new Error(`Invalid MIME type: ${mimeType}. Expected audio/* type`);
    }

    // Validate base64 string
    if (!base64String || base64String.trim().length === 0) {
      throw new Error('Invalid base64 format: empty data section');
    }

    // Convert base64 to binary
    const binaryString = atob(base64String.trim());
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create blob and return URL
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    throw new Error(`Failed to convert base64 audio data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Cleans up blob URL to prevent memory leaks
 */
export const cleanupBlobUrl = (url: string): void => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Validates if content is a valid HTTP/HTTPS URL
 */
export const isValidAudioUrl = (content: string): boolean => {
  try {
    const url = new URL(content);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Tests if an audio URL is actually accessible
 */
export const testAudioUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log('Audio URL test result:', {
      url,
      status: response.status,
      contentType: response.headers.get('content-type'),
      accessible: response.ok
    });
    return response.ok;
  } catch (error) {
    console.error('Audio URL test failed:', url, error);
    return false;
  }
};

/**
 * Helper function to detect if content is plain base64 without data URI prefix
 */
const isPlainBase64 = (content: string): boolean => {
  // Check if it's a long string that looks like base64 (no spaces, contains base64 chars)
  if (content.length > 100 && /^[A-Za-z0-9+/]+=*$/.test(content)) {
    return true;
  }
  return false;
};

/**
 * Gets the appropriate audio URL for the AudioMessage component
 * Handles both regular URLs and base64 data
 */
export const getAudioUrl = (content: string): { url: string; needsCleanup: boolean } => {
  // Process audio content silently

  if (isBase64Audio(content)) {
    console.log('getAudioUrl - Converting base64 data URI to blob');
    return {
      url: convertBase64ToBlob(content),
      needsCleanup: true
    };
  }

  // Handle plain base64 without data URI prefix
  if (isPlainBase64(content)) {
    const dataUri = `data:audio/wav;base64,${content}`;
    return {
      url: convertBase64ToBlob(dataUri),
      needsCleanup: true
    };
  }
  
  if (isValidAudioUrl(content)) {
    
    return {
      url: content,
      needsCleanup: false
    };
  }
  
  throw new Error(`Invalid audio content: must be a valid URL or base64 audio data. Received: ${typeof content} with length ${content?.length}`);
};