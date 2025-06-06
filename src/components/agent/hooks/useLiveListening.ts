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
  };
}

export const useLiveListening = () => {
  const { data: userSession } = useSession() as { data: ExtendedSession | null };
  const { company } = useParams() as { company: string };
  const {
    isLiveListening,
    sessionId,
    isLoading,
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
      corruptionRate: 0
    }
  });

  // Configuration with useMemo to prevent recreation on every render
  const vadConfig: VADConfig = useMemo(() => ({
    sampleRate: 16000,
    frameSize: 256,
    energyThreshold: 0.005,
    silenceThreshold: 1000,
    maxRecordingDuration: 30000,
    noiseFloorCalibrationTime: 500,
  }), []);

  const bufferConfig: BufferConfig = useMemo(() => ({
    maxBufferSize: 10 * 1024 * 1024, // 10MB
    segmentOverlap: 500, // 500ms
    minSegmentDuration: 1000, // 1 second
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
          })
        });

        if (!response.ok) {
          // Remove the optimistic user message on failure
          setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
          throw new Error('Failed to send audio message');
        }

        const { response: aiResponse, response_id, user_message_id } = await response.json();

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

      } catch (error) {
        console.error('Error processing queued audio segment:', error);
        // Continue processing other segments in queue
      }
    }

    isProcessingQueueRef.current = false;
    setIsLoading(false); // Clear loading when queue is empty
  }, [userSession?.user?.id, company, sessionId, getCurrentSession, setMessages, setIsLoading]);

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
    if (!bufferManagerRef.current) {
      console.error('No buffer manager available for audio processing');
      return;
    }

    stateRef.current.vadState = 'processing';

    try {
      const segment = bufferManagerRef.current.extractAndClearSegment();
      
      if (!segment) {
        // console.log('No audio segment to process - segment extraction returned null');
        return;
      }

      // console.log('Processing audio segment:', {
      //   id: segment.id,
      //   duration: segment.duration,
      //   size: segment.audioData.size,
      //   type: segment.audioData.type
      // });

      // Convert audio blob to base64 with corruption detection
      const mimeType = getSupportedMimeType();
      // console.log('Converting audio to base64 with MIME type:', mimeType);
      
      try {
        const audioData = await processAudioBlob(segment.audioData, mimeType);
        // console.log('Audio converted to base64, length:', audioData.length);

        // Update statistics for successful processing
        stateRef.current.audioStats.segmentsProcessed++;
        stateRef.current.audioStats.lastValidationError = null;
        
        // Calculate corruption rate
        const totalAttempts = stateRef.current.audioStats.segmentsProcessed + stateRef.current.audioStats.segmentsCorrupted;
        stateRef.current.audioStats.corruptionRate = totalAttempts > 0 ? 
          stateRef.current.audioStats.segmentsCorrupted / totalAttempts : 0;

        // Send to API only if audio passed validation
        // console.log('Sending validated audio to API...');
        await sendAudioMessage(audioData);
        // console.log('Audio sent to API successfully');
      } catch (audioError) {
        // Update corruption statistics
        stateRef.current.audioStats.segmentsCorrupted++;
        stateRef.current.audioStats.lastValidationError = audioError instanceof Error ? audioError.message : 'Unknown error';
        
        // Calculate corruption rate
        const totalAttempts = stateRef.current.audioStats.segmentsProcessed + stateRef.current.audioStats.segmentsCorrupted;
        stateRef.current.audioStats.corruptionRate = totalAttempts > 0 ? 
          stateRef.current.audioStats.segmentsCorrupted / totalAttempts : 0;

        console.warn('Audio validation failed, skipping segment:', {
          segmentId: segment.id,
          error: audioError instanceof Error ? audioError.message : 'Unknown error',
          segmentSize: segment.audioData.size,
          segmentDuration: segment.duration,
          corruptionRate: `${(stateRef.current.audioStats.corruptionRate * 100).toFixed(1)}%`,
          totalProcessed: stateRef.current.audioStats.segmentsProcessed,
          totalCorrupted: stateRef.current.audioStats.segmentsCorrupted
        });
        
        // Log warning if corruption rate is getting high
        if (stateRef.current.audioStats.corruptionRate > 0.3 && totalAttempts >= 5) {
          console.warn('⚠️ High audio corruption rate detected:', {
            corruptionRate: `${(stateRef.current.audioStats.corruptionRate * 100).toFixed(1)}%`,
            suggestion: 'Consider checking microphone connection or reducing background noise'
          });
        }
        
        // Don't throw the error, just log it and continue listening
        // This prevents the live listening from stopping due to occasional corrupted segments
        stateRef.current.error = null; // Clear any previous errors
      }

    } catch (error) {
      console.error('Error processing audio segment:', error);
      stateRef.current.error = 'Failed to process audio segment';
    } finally {
      stateRef.current.vadState = 'listening';
      // console.log('VAD state reset to listening');
    }
  }, [sendAudioMessage]);

  // VAD processing loop
  const startVADProcessing = useCallback(() => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
    }

    processingIntervalRef.current = setInterval(() => {
      if (!vadRef.current || !stateRef.current.isListening) {
        return;
      }

      const result = vadRef.current.processFrame();
      
      // Update VAD state based on detection
      if (vadRef.current.getState().isCalibrating) {
        stateRef.current.vadState = 'calibrating';
      } else if (result.shouldStartRecording) {
        stateRef.current.vadState = 'recording';
        // console.log('Speech detected - starting recording');
      } else if (result.shouldStopRecording) {
        // console.log('Speech ended - processing segment');
        processAudioSegment();
      } else if (vadRef.current.getState().isRecording) {
        stateRef.current.vadState = 'recording';
      } else {
        stateRef.current.vadState = 'listening';
      }

      // Debug logging for speech detection
      // if (result.isSpeech) {
      //   console.log('VAD: Speech detected', {
      //     energy: result.features.energy.toFixed(4),
      //     zcr: result.features.zeroCrossingRate.toFixed(4),
      //     spectral: result.features.spectralCentroid.toFixed(0),
      //     vadState: vadRef.current.getState().isRecording ? 'recording' : 'detecting'
      //   });
      // }
    }, 50); // Process every 50ms
  }, [processAudioSegment]);

  // Initialize live listening
  const initializeLiveListening = useCallback(async () => {
    try {
      stateRef.current.error = null;
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: vadConfig.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      streamRef.current = stream;

      // Initialize VAD
      vadRef.current = new VoiceActivityDetector(vadConfig);
      await vadRef.current.initialize(stream);

      // Initialize buffer manager
      bufferManagerRef.current = new AudioBufferManager(bufferConfig);
      const mimeType = getSupportedMimeType();
      
      await bufferManagerRef.current.startContinuousRecording(stream, mimeType);

      stateRef.current.isInitialized = true;
      stateRef.current.isListening = true;

      // Start VAD processing
      startVADProcessing();

    } catch (error) {
      console.error('Error initializing live listening:', error);
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
        corruptionRate: 0
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