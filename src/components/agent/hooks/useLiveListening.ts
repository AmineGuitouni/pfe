'use client';

import { useCallback, useRef, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useChatContext } from '../contexts/ChatContext';
import { useMiniChatSession } from './useMiniChatSession';
import { VoiceActivityDetector, VADConfig } from '../lib/voiceActivityDetection';
import { AudioBufferManager, BufferConfig } from '../lib/audioBufferManager';
import { getSupportedMimeType, processAudioBlob } from '../lib/audioUtils';
import { parseAndSplitAiResponse, createOptimisticMessage } from '../lib/messageUtils';
import { playAudioResponse } from '../lib/audioPlayback';

// Extend session type to include id
interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ExtendedSession {
  user: ExtendedUser;
  expires: string;
}

interface LiveListeningState {
  isInitialized: boolean;
  isListening: boolean;
  vadState: 'calibrating' | 'listening' | 'recording' | 'processing' | 'idle';
  error: string | null;
  audioStats: {
    segmentsProcessed: number;
    segmentsCorrupted: number;
    segmentsSkipped: number;
    lastValidationError: string | null;
    corruptionRate: number;
    zeroDurationErrors: number; // Track 0:00 specific errors
    encodingErrors: number; // Track encoding errors
  };
}

export const useLiveListening = () => {
  const { data: userSession } = useSession() as { data: ExtendedSession | null };
  const { company } = useParams() as { company: string };
  const {
    isLiveListening,
    sessionId,
    isLoading,
    isVoiceResponseEnabled,
    setMessages,
    setIsLoading,
  } = useChatContext();

  const { getCurrentSession } = useMiniChatSession();

  // Refs for audio processing
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const bufferManagerRef = useRef<AudioBufferManager | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioQueueRef = useRef<{ audioData: string; timestamp: number }[]>([]);
  const isProcessingQueueRef = useRef<boolean>(false);
  const stateRef = useRef<LiveListeningState>({
    isInitialized: false,
    isListening: false,
    vadState: 'idle',
    error: null,
    audioStats: {
      segmentsProcessed: 0,
      segmentsCorrupted: 0,
      segmentsSkipped: 0,
      lastValidationError: null,
      corruptionRate: 0,
      zeroDurationErrors: 0,
      encodingErrors: 0
    }
  });

  // Configuration with useMemo to prevent recreation on every render
  const vadConfig: VADConfig = useMemo(() => ({
    sampleRate: 16000,
    frameSize: 256,
    energyThreshold: 0.01, // Less sensitive threshold
    silenceThreshold: 2000, // 2 seconds of silence
    maxRecordingDuration: 30000,
    noiseFloorCalibrationTime: 1000, // Longer calibration for better noise floor
  }), []);

  const bufferConfig: BufferConfig = useMemo(() => ({
    maxBufferSize: 10 * 1024 * 1024, // 10MB
    segmentOverlap: 500, // 500ms
    minSegmentDuration: 1500, // Increased from 1000ms to prevent 0:00 errors
  }), []);

  // Process audio queue sequentially to prevent corruption
  const processAudioQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;
    setIsLoading(true); // Set loading when we start processing

    while (audioQueueRef.current.length > 0) {
      const queueItem = audioQueueRef.current.shift();
      if (!queueItem || !userSession?.user?.id || !company) continue;

      try {
        // Get or create session
        const currentSessionId = sessionId || await getCurrentSession('Live listening audio');
        if (!currentSessionId) {
          console.error('Failed to get or create session');
          continue;
        }

        // Create optimistic user message for audio
        const userMessage = createOptimisticMessage(queueItem.audioData, currentSessionId, 'audio');

        // Add user message immediately for optimistic UI
        setMessages(prev => [...prev, userMessage]);
        
        // Process this audio segment
        console.log('Live Listening - Processing queued audio segment:', {
          contentType: 'audio',
          queueLength: audioQueueRef.current.length,
          timestamp: queueItem.timestamp
        });

        const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company}/command-center/sessions/${currentSessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_prompt: queueItem.audioData,
            user_content_type: 'audio',
            audioResponse: isVoiceResponseEnabled,
          })
        });

        if (!response.ok) {
          // Remove the optimistic user message on failure
          setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
          throw new Error('Failed to send audio message');
        }

        const { response: aiResponse, response_id, user_message_id, aiAudioResponse } = await response.json();

        // Parse AI response and split tool results into separate messages
        const parsedMessages = parseAndSplitAiResponse(aiResponse, response_id, currentSessionId);
        
        // Update the user message with the actual ID from server and add parsed AI response(s)
        setMessages(prev => {
          const updatedMessages = prev.map(msg =>
            msg.id === userMessage.id ? { ...msg, id: user_message_id } : msg
          );
          
          // Add parsed AI response(s) to the updated messages
          return [...updatedMessages, ...parsedMessages];
        });

        // Play AI audio response if voice response is enabled and audio is provided
        if (isVoiceResponseEnabled && aiAudioResponse) {
          try {
            await playAudioResponse(aiAudioResponse, {
              onStart: () => console.log('🔊 Playing AI audio response for live listening'),
              onError: (error) => console.error('🔊 Failed to play AI audio response:', error),
            });
          } catch (error) {
            console.error('🔊 Audio playback error for live listening:', error);
          }
        }        } catch (error) {
          console.error('Error processing queued audio segment:', error);
          
          // Enhanced error logging for debugging 0:00 errors
          if (error instanceof Error) {
            if (error.message.includes('0:00') || error.message.includes('duration')) {
              console.error('🎵 Duration-related error in queue processing (0:00 error):', {
                error: error.message,
                audioDataLength: queueItem.audioData.length,
                timestamp: queueItem.timestamp,
                queueLength: audioQueueRef.current.length,
                suggestion: 'Audio segment too short or corrupted - check buffer clearing mechanism'
              });
              stateRef.current.audioStats.zeroDurationErrors++;
            } else if (error.message.includes('base64') || error.message.includes('encoding')) {
              console.error('🎵 Encoding error in queue processing:', {
                error: error.message,
                audioDataPreview: queueItem.audioData.substring(0, 100),
                audioDataLength: queueItem.audioData.length,
                suggestion: 'Audio encoding corruption detected - check MediaRecorder state'
              });
              stateRef.current.audioStats.encodingErrors++;
            } else {
              console.error('🎵 General error in queue processing:', {
                error: error.message,
                audioDataLength: queueItem.audioData.length,
                timestamp: queueItem.timestamp
              });
            }
          }
          
          // Continue processing other segments in queue
        }
    }

    isProcessingQueueRef.current = false;
    setIsLoading(false); // Clear loading when queue is empty
  }, [userSession?.user?.id, company, sessionId, isVoiceResponseEnabled, getCurrentSession, setMessages, setIsLoading]);

  // Queue audio message for processing
  const sendAudioMessage = useCallback(async (audioData: string) => {
    if (!userSession?.user?.id || !company) return;

    // For live listening, we queue the audio but respect the current loading state
    // If we're currently processing messages, we still queue but may delay processing
    console.log('Live listening - Audio segment ready to queue, current loading state:', isLoading);

    // Prevent queue overflow - limit to 10 items max
    const MAX_QUEUE_SIZE = 10;
    if (audioQueueRef.current.length >= MAX_QUEUE_SIZE) {
      console.warn('Live listening - Audio queue full, dropping oldest segment');
      audioQueueRef.current.shift(); // Remove oldest item
    }

    // Add to queue instead of processing immediately
    audioQueueRef.current.push({
      audioData,
      timestamp: Date.now()
    });

    console.log('Live listening - Audio segment queued, queue length:', audioQueueRef.current.length);

    // Start processing queue if not already processing
    // We can still queue during loading, but processing will handle the loading state
    processAudioQueue();
  }, [userSession?.user?.id, company, isLoading, processAudioQueue]);


  // Process audio segment
  const processAudioSegment = useCallback(async () => {
  if (!bufferManagerRef.current || stateRef.current.vadState === 'processing') {
    return;
  }
  
  stateRef.current.vadState = 'processing';
  
  try {
    // Add a small delay to ensure all audio data is captured
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const segment = bufferManagerRef.current.extractAndClearSegment();
    
    if (!segment) {
      console.log('No valid audio segment extracted');
      return;
    }
    
    // Validate segment before processing
    if (segment.duration < 500) { // Reduced minimum to 500ms for more responsiveness
      console.warn('Segment too short, discarding:', segment.duration);
      stateRef.current.audioStats.segmentsSkipped++;
      return;
    }
    
    // Convert to base64
    try {
      const audioData = await processAudioBlob(segment.audioData, getSupportedMimeType());
      
      // Additional validation of base64 data
      const base64Part = audioData.split(',')[1];
      if (!base64Part || base64Part.length < 1500) {
        throw new Error('Base64 data too short');
      }
      
      console.log('Audio segment processed successfully');
      stateRef.current.audioStats.segmentsProcessed++;
      
      await sendAudioMessage(audioData);
      
    } catch (error) {
      console.error('Failed to process audio:', error);
      stateRef.current.audioStats.segmentsCorrupted++;
    }
    
  } finally {
    // Reset VAD state after a delay to prevent immediate re-triggering
    setTimeout(() => {
      stateRef.current.vadState = 'listening';
      // Reset VAD to ensure clean state
      vadRef.current?.reset();
    }, 200);
  }
}, [sendAudioMessage]);

  // VAD processing loop
  const startVADProcessing = useCallback(() => {
  if (processingIntervalRef.current) {
    clearInterval(processingIntervalRef.current);
  }
  
  // VAD's processFrame method now handles silence detection and max duration internally
  // by setting shouldStopRecording. So, silenceFrameCount here is removed.
  
  processingIntervalRef.current = setInterval(() => {
    if (!vadRef.current || !stateRef.current.isListening) {
      return;
    }
    
    const result = vadRef.current.processFrame(); // Contains isSpeech, shouldStartRecording, shouldStopRecording
    
    if (vadRef.current.getState().isCalibrating) {
      stateRef.current.vadState = 'calibrating';
      return;
    }
    
    if (result.shouldStartRecording) {
      console.log('🎤 Speech started (VAD determined shouldStartRecording)');
      stateRef.current.vadState = 'recording';
      // Perform a full reset of AudioBufferManager to ensure audio capture starts precisely from this moment.
      // This clears previous (silent) chunks, resets recordingStartTime, and re-initializes MediaRecorder.
      bufferManagerRef.current?.resetBufferForNextSegment().catch(err => {
        console.error("Error during resetBufferForNextSegment on speech start:", err);
      });
      console.log('🎵 AudioBufferManager.resetBufferForNextSegment() initiated for new speech segment.');
    } else if (result.shouldStopRecording) {
      console.log('🎤 Speech ended (VAD determined shouldStopRecording). Processing segment...');
      processAudioSegment(); 
      // processAudioSegment calls extractAndClearSegment, which itself calls resetBufferForNextSegment
      // to prepare for the *next* segment after this one is processed.
      stateRef.current.vadState = 'listening'; // Transition back to listening state.
    } else if (vadRef.current.getState().isRecording) {
      // Speech is ongoing (result.isSpeech is true), VAD is in 'recording' state,
      // but it's not the start or end of the segment according to VAD.
      stateRef.current.vadState = 'recording';
    } else {
      // Not recording, VAD is not indicating start or stop. Must be listening.
      stateRef.current.vadState = 'listening';
    }
  }, 50); // Process VAD every 50ms
}, [processAudioSegment]);

  // Initialize live listening
  const initializeLiveListening = useCallback(async () => {
    try {
      console.log('🎙️ Starting live listening initialization...');
      stateRef.current.error = null;
      
      // Request microphone permission
      console.log('🎙️ Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: vadConfig.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      console.log('🎙️ Microphone access granted, stream active:', stream.active);
      console.log('🎙️ Audio tracks:', stream.getAudioTracks().map(track => ({
        label: track.label,
        enabled: track.enabled,
        readyState: track.readyState
      })));

      streamRef.current = stream;

      // Initialize VAD
      console.log('🎙️ Initializing VAD with config:', vadConfig);
      vadRef.current = new VoiceActivityDetector(vadConfig);
      await vadRef.current.initialize(stream);
      console.log('🎙️ VAD initialized successfully');

      // Initialize buffer manager
      console.log('🎙️ Initializing buffer manager...');
      bufferManagerRef.current = new AudioBufferManager(bufferConfig);
      const mimeType = getSupportedMimeType();
      console.log('🎙️ Using MIME type:', mimeType);
      
      await bufferManagerRef.current.startContinuousRecording(stream, mimeType);
      console.log('🎙️ Buffer manager started recording');

      stateRef.current.isInitialized = true;
      stateRef.current.isListening = true;

      // Start VAD processing
      console.log('🎙️ Starting VAD processing loop...');
      startVADProcessing();
      console.log('🎙️ Live listening fully initialized!');

    } catch (error) {
      console.error('❌ Error initializing live listening:', error);
      stateRef.current.error = 'Failed to initialize microphone';
      throw error;
    }
  }, [vadConfig, bufferConfig, startVADProcessing]);

  // Cleanup live listening
  const cleanupLiveListening = useCallback(() => {
    // Stop processing
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }

    // Clear audio queue
    audioQueueRef.current = [];
    isProcessingQueueRef.current = false;

    // Cleanup VAD
    if (vadRef.current) {
      vadRef.current.cleanup();
      vadRef.current = null;
    }

    // Cleanup buffer manager
    if (bufferManagerRef.current) {
      bufferManagerRef.current.cleanup();
      bufferManagerRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    stateRef.current = {
      isInitialized: false,
      isListening: false,
      vadState: 'idle',
      error: null,
      audioStats: {
        segmentsProcessed: 0,
        segmentsCorrupted: 0,
        segmentsSkipped: 0,
        lastValidationError: null,
        corruptionRate: 0,
        zeroDurationErrors: 0,
        encodingErrors: 0
      }
    };
    
    console.log('Live listening cleanup completed - audio queue cleared');
  }, []);

  // Effect to handle isLiveListening state changes
  useEffect(() => {
    if (isLiveListening && !stateRef.current.isInitialized) {
      initializeLiveListening().catch((error) => {
        console.error('Failed to start live listening:', error);
        stateRef.current.error = 'Failed to start live listening';
      });
    } else if (!isLiveListening && stateRef.current.isInitialized) {
      cleanupLiveListening();
    }
  }, [isLiveListening, initializeLiveListening, cleanupLiveListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupLiveListening();
    };
  }, [cleanupLiveListening]);

  // Get current state for UI
  const getCurrentState = useCallback(() => {
    return {
      ...stateRef.current,
      vadState: vadRef.current?.getState(),
      bufferStatus: bufferManagerRef.current?.getBufferStatus()
    };
  }, []);

  // Helper function to get live listening state in the format expected by MiniAiChat
  const getLiveListeningState = useCallback(() => ({
    vadState: stateRef.current.vadState || 'stopped',
    isInitialized: stateRef.current.isInitialized
  }), []);

  // Get audio validation statistics
  const getAudioStats = useCallback(() => ({
    ...stateRef.current.audioStats,
    healthStatus: stateRef.current.audioStats.corruptionRate < 0.1 ? 'excellent' :
                  stateRef.current.audioStats.corruptionRate < 0.3 ? 'good' :
                  stateRef.current.audioStats.corruptionRate < 0.5 ? 'poor' : 'critical'
  }), []);

  return {
    // State
    isInitialized: stateRef.current.isInitialized,
    isListening: stateRef.current.isListening,
    vadState: stateRef.current.vadState,
    error: stateRef.current.error,
    
    // Methods
    getCurrentState,
    processAudioSegment,
    getLiveListeningState,
    getAudioStats,
  };
};
