/**
 * Get the first supported MIME type for MediaRecorder
 */
export const getSupportedMimeType = (): string => {
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/wav'
  ];
  
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  
  throw new Error('No supported audio format found');
};

/**
 * Validate and normalize audio data format
 */
export const validateAudioData = (audioData: string): string => {
  // Check if we have valid data at all
  if (!audioData || typeof audioData !== 'string') {
    throw new Error('No valid base64 data generated from audio blob');
  }
  
  // If the data doesn't start with "data:", something went wrong
  if (!audioData.startsWith('data:')) {
    throw new Error('Base64 data does not start with data URI scheme');
  }
  
  // More lenient validation - check for any audio type, not just strict format
  const audioFormatRegex = /^data:audio\/([^;]+);base64,(.+)$/;
  const match = audioData.match(audioFormatRegex);
  
  if (!match) {
    // Try to fix common issues - maybe the MIME type is different
    if (audioData.startsWith('data:') && audioData.includes('base64,')) {
      console.log('Attempting to fix MIME type...');
      // Extract the base64 part and construct proper audio data URL
      const base64Part = audioData.split('base64,')[1];
      if (base64Part) {
        const correctedData = `data:audio/webm;base64,${base64Part}`;
        console.log('Corrected format:', correctedData.substring(0, 50));
        return correctedData;
      } else {
        throw new Error('Could not extract valid audio data');
      }
    } else {
      throw new Error('Invalid audio format generated');
    }
  }
  
  return audioData;
};

/**
 * Process audio blob and convert to base64
 */
export const processAudioBlob = (
  audioBlob: Blob,
  selectedMimeType: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('Audio blob created:', {
      size: audioBlob.size,
      type: audioBlob.type
    });
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const audioData = reader.result as string;
        
        // Debug logging to see what format we're getting
        console.log('Audio data format check:', {
          hasResult: !!audioData,
          startsWithData: audioData?.startsWith('data:'),
          length: audioData?.length,
          preview: audioData?.substring(0, 100)
        });
        
        const validatedData = validateAudioData(audioData);
        resolve(validatedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read audio blob'));
    };
    
    reader.readAsDataURL(audioBlob);
  });
};

/**
 * Create MediaRecorder with optimal settings
 */
export const createMediaRecorder = (
  stream: MediaStream,
  onDataAvailable: (event: BlobEvent) => void,
  onStop: () => void
): MediaRecorder => {
  const selectedMimeType = getSupportedMimeType();
  
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: selectedMimeType
  });
  
  mediaRecorder.ondataavailable = onDataAvailable;
  mediaRecorder.onstop = onStop;
  
  return mediaRecorder;
};

/**
 * Request microphone permission with optimal settings
 */
export const requestMicrophonePermission = async (): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 44100,
        channelCount: 1
      }
    });
    
    return stream;
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    throw new Error('Failed to access microphone. Please check permissions.');
  }
};

/**
 * Stop all tracks in a media stream
 */
export const stopMediaStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};

/**
 * Log audio recording debug information
 */
export const logAudioDebugInfo = (
  audioChunks: Blob[],
  selectedMimeType: string
): void => {
  console.log('Creating audio blob:', {
    chunksCount: audioChunks.length,
    totalSize: audioChunks.reduce((sum, chunk) => sum + chunk.size, 0),
    selectedMimeType
  });
};