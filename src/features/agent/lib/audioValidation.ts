/**
 * Audio validation utilities for detecting corrupted or invalid audio data
 */

export interface AudioValidationResult {
  isValid: boolean;
  isCorrupted: boolean;
  errors: string[];
  warnings: string[];
  details: {
    size: number;
    format: string;
    duration?: number;
    bitrate?: number;
    sampleRate?: number;
    hasValidHeaders: boolean;
    base64Length: number;
    estimatedDuration?: number;
  };
}

/**
 * Comprehensive audio validation including corruption detection
 */
export const validateAudioData = async (audioData: string): Promise<AudioValidationResult> => {
  const result: AudioValidationResult = {
    isValid: false,
    isCorrupted: false,
    errors: [],
    warnings: [],
    details: {
      size: 0,
      format: 'unknown',
      hasValidHeaders: false,
      base64Length: 0
    }
  };

  try {
    // Basic format validation
    if (!audioData || typeof audioData !== 'string') {
      result.errors.push('Audio data is empty or not a string');
      return result;
    }

    // Check if it's a valid data URI
    if (!audioData.startsWith('data:')) {
      result.errors.push('Audio data does not start with data URI scheme');
      return result;
    }

    // Parse data URI
    const audioFormatRegex = /^data:audio\/([^;]+);base64,(.+)$/;
    const match = audioData.match(audioFormatRegex);
    
    if (!match) {
      result.errors.push('Invalid audio data URI format');
      return result;
    }

    const [, format, base64String] = match;
    result.details.format = format;
    result.details.base64Length = base64String.length;

    // Validate base64 string
    if (!base64String || base64String.trim().length === 0) {
      result.errors.push('Base64 audio data is empty');
      return result;
    }

    // Check for valid base64 characters
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64String.trim())) {
      result.errors.push('Invalid base64 characters detected');
      result.isCorrupted = true;
      return result;
    }

    // Estimate size and check for reasonable bounds
    const estimatedSize = (base64String.length * 3) / 4;
    result.details.size = estimatedSize;

    // Check for suspiciously small audio files (likely corrupted)
    if (estimatedSize < 100) {
      result.errors.push(`Audio file too small (${estimatedSize} bytes) - likely corrupted`);
      result.isCorrupted = true;
      return result;
    }

    // Check for unreasonably large files (>50MB)
    if (estimatedSize > 50 * 1024 * 1024) {
      result.errors.push(`Audio file too large (${estimatedSize} bytes) - possible corruption`);
      result.isCorrupted = true;
      return result;
    }

    // Try to decode base64 and check for corruption
    try {
      const binaryString = atob(base64String.trim());
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Check audio file headers for common formats
      const headerValidation = validateAudioHeaders(bytes, format);
      result.details.hasValidHeaders = headerValidation.isValid;
      
      if (!headerValidation.isValid) {
        result.errors.push(...headerValidation.errors);
        result.isCorrupted = true;
      }

      if (headerValidation.warnings.length > 0) {
        result.warnings.push(...headerValidation.warnings);
      }

      // Additional format-specific validations
      const formatValidation = validateAudioFormat(bytes, format);
      if (!formatValidation.isValid) {
        result.errors.push(...formatValidation.errors);
        result.isCorrupted = true;
      }

      // Estimate duration based on format and file size
      const durationEstimate = estimateAudioDuration(bytes, format);
      if (durationEstimate) {
        result.details.estimatedDuration = durationEstimate;
        
        // Check for unreasonable duration (too short or too long)
        if (durationEstimate < 0.1) {
          result.warnings.push(`Audio duration too short (${durationEstimate}s) - may be corrupted`);
        } else if (durationEstimate > 300) {
          result.warnings.push(`Audio duration very long (${durationEstimate}s) - unusual for voice input`);
        }
      }

    } catch (decodeError) {
      result.errors.push(`Failed to decode base64 audio data: ${decodeError instanceof Error ? decodeError.message : 'Unknown error'}`);
      result.isCorrupted = true;
      return result;
    }

    // If we got here without errors, the audio is likely valid
    result.isValid = result.errors.length === 0;
    
  } catch (validationError) {
    result.errors.push(`Audio validation failed: ${validationError instanceof Error ? validationError.message : 'Unknown error'}`);
    result.isCorrupted = true;
  }

  return result;
};

/**
 * Validate audio file headers for common formats
 */
const validateAudioHeaders = (bytes: Uint8Array, format: string): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const result: { isValid: boolean; errors: string[]; warnings: string[] } = { isValid: false, errors: [], warnings: [] };

  if (bytes.length < 12) {
    result.errors.push('Audio file too small to contain valid headers');
    return result;
  }

  switch (format.toLowerCase()) {
    case 'wav':
      result.isValid = validateWAVHeaders(bytes);
      if (!result.isValid) {
        result.errors.push('Invalid WAV file headers');
      }
      break;
      
    case 'webm':
      result.isValid = validateWebMHeaders(bytes);
      if (!result.isValid) {
        result.errors.push('Invalid WebM file headers');
      }
      break;
      
    case 'mp3':
    case 'mpeg':
      result.isValid = validateMP3Headers(bytes);
      if (!result.isValid) {
        result.errors.push('Invalid MP3 file headers');
      }
      break;
      
    case 'mp4':
    case 'm4a':
      result.isValid = validateMP4Headers(bytes);
      if (!result.isValid) {
        result.errors.push('Invalid MP4 file headers');
      }
      break;
      
    default:
      result.warnings.push(`Unknown audio format: ${format} - cannot validate headers`);
      result.isValid = true; // Don't fail on unknown formats
  }

  return result;
};

/**
 * Validate WAV file headers
 */
const validateWAVHeaders = (bytes: Uint8Array): boolean => {
  // Check RIFF header
  const riffHeader = String.fromCharCode(...bytes.slice(0, 4));
  if (riffHeader !== 'RIFF') return false;
  
  // Check WAVE identifier
  const waveHeader = String.fromCharCode(...bytes.slice(8, 12));
  return waveHeader === 'WAVE';
};

/**
 * Validate WebM file headers
 */
const validateWebMHeaders = (bytes: Uint8Array): boolean => {
  // WebM files start with EBML header
  // Check for EBML signature: 0x1A, 0x45, 0xDF, 0xA3
  return bytes.length >= 4 && 
         bytes[0] === 0x1A && 
         bytes[1] === 0x45 && 
         bytes[2] === 0xDF && 
         bytes[3] === 0xA3;
};

/**
 * Validate MP3 file headers
 */
const validateMP3Headers = (bytes: Uint8Array): boolean => {
  // Check for MP3 frame sync (11 bits set to 1)
  // ID3 tag or frame header
  if (bytes.length >= 3) {
    // Check for ID3 tag
    const id3Header = String.fromCharCode(...bytes.slice(0, 3));
    if (id3Header === 'ID3') return true;
    
    // Check for MP3 frame header (sync bits)
    if (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) return true;
  }
  
  return false;
};

/**
 * Validate MP4 file headers
 */
const validateMP4Headers = (bytes: Uint8Array): boolean => {
  if (bytes.length < 8) return false;
  
  // Check for ftyp box at beginning
  const ftyp = String.fromCharCode(...bytes.slice(4, 8));
  return ftyp === 'ftyp';
};

/**
 * Additional format-specific validation
 */
const validateAudioFormat = (bytes: Uint8Array, _format: string): { isValid: boolean; errors: string[] } => {
  const result: { isValid: boolean; errors: string[] } = { isValid: true, errors: [] };

  // Check for common corruption patterns
  
  // All zeros (silent/corrupted file)
  const allZeros = bytes.every(byte => byte === 0);
  if (allZeros) {
    result.isValid = false;
    result.errors.push('Audio file contains only zeros - likely corrupted or silent');
    return result;
  }

  // All same value (corrupted)
  const firstByte = bytes[0];
  const allSameValue = bytes.every(byte => byte === firstByte);
  if (allSameValue && bytes.length > 100) {
    result.isValid = false;
    result.errors.push(`Audio file contains only repeated value (${firstByte}) - corrupted`);
    return result;
  }

  // Check for reasonable entropy/randomness in audio data
  const entropy = calculateEntropy(bytes.slice(0, Math.min(1024, bytes.length)));
  if (entropy < 2.0) {
    result.errors.push('Audio data has low entropy - may be corrupted or contain no audio');
    result.isValid = false;
  }

  return result;
};

/**
 * Calculate entropy of byte array (measure of randomness)
 */
const calculateEntropy = (bytes: Uint8Array): number => {
  const frequency = new Array(256).fill(0);
  
  // Count frequency of each byte value
  for (const byte of bytes) {
    frequency[byte]++;
  }
  
  // Calculate entropy
  let entropy = 0;
  const length = bytes.length;
  
  for (const count of frequency) {
    if (count > 0) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }
  }
  
  return entropy;
};

/**
 * Estimate audio duration based on format and file size
 */
const estimateAudioDuration = (bytes: Uint8Array, format: string): number | null => {
  const fileSize = bytes.length;
  
  // Rough estimates based on common bitrates
  switch (format.toLowerCase()) {
    case 'wav':
      // Assume 16-bit, 44.1kHz, mono: ~88KB per second
      return fileSize / (44100 * 2); // rough estimate
      
    case 'webm':
      // WebM with Opus codec, roughly 32kbps for voice
      return (fileSize * 8) / (32 * 1000); // bits to seconds
      
    case 'mp3':
      // Assume 128kbps average
      return (fileSize * 8) / (128 * 1000);
      
    case 'mp4':
    case 'm4a':
      // Assume 128kbps AAC
      return (fileSize * 8) / (128 * 1000);
      
    default:
      return null;
  }
};

/**
 * Quick validation for live audio processing (performance optimized)
 */
export const quickValidateAudio = (audioData: string): { isValid: boolean; error?: string } => {
  // Basic checks only for performance
  if (!audioData || typeof audioData !== 'string') {
    return { isValid: false, error: 'Empty or invalid audio data' };
  }

  if (!audioData.startsWith('data:audio/')) {
    return { isValid: false, error: 'Invalid audio data URI format' };
  }

  const parts = audioData.split(',');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Malformed base64 data URI' };
  }

  const base64String = parts[1];
  if (!base64String || base64String.length < 100) {
    return { isValid: false, error: 'Audio data too small or empty' };
  }

  // Quick base64 format check
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(base64String.trim())) {
    return { isValid: false, error: 'Invalid base64 encoding' };
  }

  return { isValid: true };
};
