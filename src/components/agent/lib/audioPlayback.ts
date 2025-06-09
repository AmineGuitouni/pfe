/**
 * Audio Playback Utility
 * Handles playing AI audio responses when voice response is enabled
 */

export interface AudioPlaybackOptions {
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

/**
 * Plays an audio URL with optional callbacks
 * @param audioUrl - The URL of the audio to play
 * @param options - Optional playback configuration
 * @returns Promise that resolves when audio starts playing
 */
export const playAudioResponse = async (
  audioUrl: string,
  options: AudioPlaybackOptions = {}
): Promise<void> => {
  const { volume = 1.0, onStart, onEnd, onError } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create a new audio element
      const audio = new Audio(audioUrl);
      
      // Set volume
      audio.volume = Math.max(0, Math.min(1, volume));
      
      // Set up event listeners
      audio.onloadstart = () => {
        console.log('🔊 Starting to load AI audio response');
        onStart?.();
      };

      audio.oncanplay = () => {
        console.log('🔊 AI audio response ready to play');
        resolve();
      };

      audio.onended = () => {
        console.log('🔊 AI audio response playback finished');
        onEnd?.();
        // Clean up the audio element
        audio.remove();
      };

      audio.onerror = (_event) => {
        const errorMessage = `Failed to play AI audio response: ${audio.error?.message || 'Unknown error'}`;
        console.error('🔊 AI audio playback error:', errorMessage);
        onError?.(errorMessage);
        reject(new Error(errorMessage));
        // Clean up the audio element
        audio.remove();
      };

      // Start playing
      audio.play().catch((playError) => {
        const errorMessage = `Failed to start AI audio playback: ${playError.message}`;
        console.error('🔊 Audio play error:', errorMessage);
        onError?.(errorMessage);
        reject(playError);
        // Clean up the audio element
        audio.remove();
      });

    } catch (error) {
      const errorMessage = `Audio playback initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('🔊 Audio playback error:', errorMessage);
      onError?.(errorMessage);
      reject(new Error(errorMessage));
    }
  });
};

/**
 * Checks if the browser can play the given audio URL
 * @param audioUrl - The URL to check
 * @returns Promise<boolean> indicating if the audio can be played
 */
export const canPlayAudio = async (audioUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      
      audio.oncanplay = () => {
        resolve(true);
        audio.remove();
      };
      
      audio.onerror = () => {
        resolve(false);
        audio.remove();
      };
      
      // Set a timeout to avoid hanging
      setTimeout(() => {
        resolve(false);
        audio.remove();
      }, 5000);
      
      audio.src = audioUrl;
    } catch {
      resolve(false);
    }
  });
};
