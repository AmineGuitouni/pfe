/**
 * Test utilities for audio validation
 * These functions help test and verify the audio corruption detection system
 */

import { quickValidateAudio, validateAudioComprehensively } from './audioUtils';

/**
 * Create test audio data for validation testing
 */
export const createTestAudioData = {
  valid: (): string => {
    // Create a minimal valid WAV header followed by some audio data
    const wavHeader = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // File size - 8
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      0x66, 0x6d, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // Subchunk1Size (16 for PCM)
      0x01, 0x00,             // AudioFormat (1 for PCM)
      0x01, 0x00,             // NumChannels (1)
      0x44, 0xac, 0x00, 0x00, // SampleRate (44100)
      0x88, 0x58, 0x01, 0x00, // ByteRate
      0x02, 0x00,             // BlockAlign
      0x10, 0x00,             // BitsPerSample (16)
      0x64, 0x61, 0x74, 0x61, // "data"
      0x00, 0x00, 0x00, 0x00  // Subchunk2Size
    ]);
    
    // Add some random audio data
    const audioData = new Uint8Array(200);
    for (let i = 0; i < audioData.length; i++) {
      audioData[i] = Math.floor(Math.random() * 256);
    }
    
    const combined = new Uint8Array(wavHeader.length + audioData.length);
    combined.set(wavHeader);
    combined.set(audioData, wavHeader.length);
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...combined));
    return `data:audio/wav;base64,${base64}`;
  },

  corrupted: (): string => {
    // Create corrupted audio data (all zeros)
    const corruptedData = new Uint8Array(100).fill(0);
    const base64 = btoa(String.fromCharCode(...corruptedData));
    return `data:audio/wav;base64,${base64}`;
  },

  malformed: (): string => {
    // Create malformed data URI
    return 'data:audio/wav;base64,invalid_base64_data!!!';
  },

  empty: (): string => {
    return 'data:audio/wav;base64,';
  },

  wrongMimeType: (): string => {
    const validAudioData = new Uint8Array(200);
    for (let i = 0; i < validAudioData.length; i++) {
      validAudioData[i] = Math.floor(Math.random() * 256);
    }
    const base64 = btoa(String.fromCharCode(...validAudioData));
    return `data:image/png;base64,${base64}`;
  }
};

/**
 * Test the audio validation system
 */
export const testAudioValidation = async (): Promise<{
  quickValidation: Record<string, any>;
  comprehensiveValidation: Record<string, any>;
}> => {
  const testCases = {
    valid: createTestAudioData.valid(),
    corrupted: createTestAudioData.corrupted(),
    malformed: createTestAudioData.malformed(),
    empty: createTestAudioData.empty(),
    wrongMimeType: createTestAudioData.wrongMimeType()
  };

  const quickResults: Record<string, any> = {};
  const comprehensiveResults: Record<string, any> = {};

  for (const [testName, testData] of Object.entries(testCases)) {
    console.log(`Testing audio validation for: ${testName}`);
    
    // Quick validation test
    try {
      quickResults[testName] = quickValidateAudio(testData);
    } catch (error) {
      quickResults[testName] = {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Comprehensive validation test
    try {
      comprehensiveResults[testName] = await validateAudioComprehensively(testData);
    } catch (error) {
      comprehensiveResults[testName] = {
        isValid: false,
        isCorrupted: true,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        shouldRetry: false
      };
    }
  }

  return {
    quickValidation: quickResults,
    comprehensiveValidation: comprehensiveResults
  };
};

/**
 * Log test results in a readable format
 */
export const logTestResults = (results: Awaited<ReturnType<typeof testAudioValidation>>): void => {
  console.group('🔊 Audio Validation Test Results');
  
  console.group('Quick Validation Results:');
  Object.entries(results.quickValidation).forEach(([testName, result]) => {
    const status = result.isValid ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}:`, result);
  });
  console.groupEnd();

  console.group('Comprehensive Validation Results:');
  Object.entries(results.comprehensiveValidation).forEach(([testName, result]) => {
    const status = result.isValid ? '✅ PASS' : '❌ FAIL';
    const corruption = result.isCorrupted ? '🔴 CORRUPTED' : '🟢 CLEAN';
    console.log(`${status} ${corruption} ${testName}:`, result);
  });
  console.groupEnd();
  
  console.groupEnd();
};

/**
 * Run audio validation tests (for development/debugging)
 */
export const runAudioValidationTests = async (): Promise<void> => {
  try {
    const results = await testAudioValidation();
    logTestResults(results);
  } catch (error) {
    console.error('Failed to run audio validation tests:', error);
  }
};
