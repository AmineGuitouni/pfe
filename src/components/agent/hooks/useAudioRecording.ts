'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useChatContext } from '../contexts/ChatContext';
import { useMiniChatSession } from './useMiniChatSession';
import { 
  requestMicrophonePermission,
  createMediaRecorder,
  processAudioBlob,
  stopMediaStream,
  logAudioDebugInfo
} from '../lib/audioUtils';
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

export const useAudioRecording = () => {
  const { data: userSession } = useSession() as { data: ExtendedSession | null };
  const { company } = useParams() as { company: string };
  const {
    isRecording,
    sessionId,
    isLoading,
    setIsRecording,
    setMessages,
    setIsLoading,
  } = useChatContext();

  const { getCurrentSession } = useMiniChatSession();

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Send audio message
  const sendAudioMessage = useCallback(async (audioData: string) => {
    if (!userSession?.user?.id || !company || isLoading) return;

    // Prevent duplicate sends by immediately setting loading
    setIsLoading(true);

    // Get or create session
    const currentSessionId = sessionId || await getCurrentSession('Audio message');
    if (!currentSessionId) {
      console.error('Failed to get or create session');
      setIsLoading(false);
      return;
    }

    // Create optimistic user message for audio
    const userMessage = createOptimisticMessage(audioData, currentSessionId, 'audio');

    // Add user message immediately for optimistic UI
    setMessages(prev => [...prev, userMessage]);

    try {
      console.log('Sending audio data to API:', {
        contentType: 'audio',
        dataPreview: audioData.substring(0, 50),
        sessionId: currentSessionId
      });

      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company}/command-center/sessions/${currentSessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_prompt: audioData,
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
      console.error('Error sending audio message:', error);
      // Remove the optimistic user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [userSession?.user?.id, company, sessionId, isLoading, getCurrentSession, setMessages, setIsLoading]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await requestMicrophonePermission();
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      // Create MediaRecorder instance
      const mediaRecorder = createMediaRecorder(
        stream,
        (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        },
        async () => {
          try {
            if (audioChunksRef.current.length === 0) {
              console.warn('No audio data recorded');
              return;
            }
            
            logAudioDebugInfo(audioChunksRef.current, mediaRecorder.mimeType);
            
            // Create blob from recorded chunks
            const audioBlob = new Blob(audioChunksRef.current, {
              type: mediaRecorder.mimeType
            });
            
            // Process audio blob and get base64 data
            const audioData = await processAudioBlob(audioBlob, mediaRecorder.mimeType);
            
            // Send the audio message
            await sendAudioMessage(audioData);
            
          } catch (error) {
            console.error('Error processing recorded audio:', error);
            alert('Failed to process recorded audio. Please try again.');
          } finally {
            // Cleanup
            stopMediaStream(streamRef.current);
            streamRef.current = null;
          }
        }
      );
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting audio recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  }, [sendAudioMessage, setIsRecording]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, [setIsRecording]);

  // Cleanup audio resources on unmount
  useEffect(() => {
    return () => {
      stopMediaStream(streamRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    // State
    isRecording,
    
    // Actions
    startRecording,
    stopRecording,
  };
};