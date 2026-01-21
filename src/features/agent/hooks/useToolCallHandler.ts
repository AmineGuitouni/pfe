'use client';

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useChatContext } from '../contexts/ChatContext';
import { parseAndSplitAiResponse } from '../lib/messageUtils';
import { SessionMessage } from '../lib/types';
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

export const useToolCallHandler = () => {
  const { data: userSession } = useSession() as { data: ExtendedSession | null };
  const { company } = useParams() as { company: string };
  const {
    sessionId,
    isVoiceResponseEnabled,
    setMessages,
    isToolCallLoading,
    isRetrying,
    setIsToolCallLoading,
    setIsRetrying,
    setIsLoading
  } = useChatContext();

  // Tool call action handler
  const toolCallAction = useCallback(async (action: "accept" | "reject") => {
    if (!userSession?.user?.id || !company || !sessionId) return;

    setIsToolCallLoading(true);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company}/command-center/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accept_tool_call: action === 'accept',
          reject_tool_call: action === 'reject',
          audioResponse: isVoiceResponseEnabled,
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} tool call`);
      }

      const { response: aiResponse, response_id, toolCallMessage, aiAudioResponse } = await response.json();

      // Parse AI response and split tool results into separate messages
      const parsedMessages = parseAndSplitAiResponse(aiResponse, response_id, sessionId);

      // Create user action message
      const toolActionMessage:SessionMessage = {
        id: toolCallMessage.id,
        session_id: sessionId,
        sender: 'tool',
        content: toolCallMessage.content,
        content_type: 'text',
        created_at: new Date().toISOString()
      }

      // Add user action and parsed AI response(s)
      setMessages(prev => [
        ...prev,
        toolActionMessage,
        ...parsedMessages
      ]);

      // Play AI audio response if voice response is enabled and audio is provided
      if (isVoiceResponseEnabled && aiAudioResponse) {
        try {
          await playAudioResponse(aiAudioResponse, {
            onStart: () => console.log(`🔊 Playing AI audio response for tool call ${action}`),
            onError: (error) => console.error('🔊 Failed to play AI audio response:', error),
          });
        } catch (error) {
          console.error(`🔊 Audio playback error for tool call ${action}:`, error);
        }
      }

    } catch (error) {
      console.error(`Error ${action}ing tool call:`, error);
    } finally {
      setIsToolCallLoading(false);
      setIsLoading(false);
    }
  }, [userSession?.user?.id, company, sessionId, isVoiceResponseEnabled, setMessages, setIsToolCallLoading, setIsLoading]);

  // Retry last message functionality
  const retryLastMessage = useCallback(async () => {
    if (!userSession?.user?.id || !company || !sessionId) {
      return {
        error: 'Missing required fields'
      };
    }

    setIsRetrying(true);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company}/command-center/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Empty body - the API will process the existing last user message
          audioResponse: isVoiceResponseEnabled,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to retry message');
      }

      const { response: aiResponse, response_id, error, aiAudioResponse } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Parse AI response and split tool results into separate messages
      const parsedMessages = parseAndSplitAiResponse(aiResponse, response_id, sessionId);

      // Add new AI response(s) to existing messages
      setMessages(prev => [...prev, ...parsedMessages]);

      // Play AI audio response if voice response is enabled and audio is provided
      if (isVoiceResponseEnabled && aiAudioResponse) {
        try {
          await playAudioResponse(aiAudioResponse, {
            onStart: () => console.log('🔊 Playing AI audio response for retry'),
            onError: (error) => console.error('🔊 Failed to play AI audio response:', error),
          });
        } catch (error) {
          console.error('🔊 Audio playback error for retry:', error);
        }
      }

    } catch (error) {
      console.error('Error retrying message:', error);
      return {
        error: 'Failed to retry message'
      };
    } finally {
      setIsRetrying(false);
      setIsLoading(false);
    }
  }, [userSession?.user?.id, company, sessionId, isVoiceResponseEnabled, setMessages, setIsRetrying, setIsLoading]);

  return {
    toolCallAction,
    retryLastMessage,
    isToolCallLoading,
    isRetrying,
  };
};