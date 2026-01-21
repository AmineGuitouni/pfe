'use client';

import { useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useChatContext } from '../contexts/ChatContext';
import { useMiniChatSession } from './useMiniChatSession';
import { 
  parseAndSplitAiResponse, 
  createOptimisticMessage, 
  transformApiMessages 
} from '../lib/messageUtils';
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

export const useMessageManager = () => {
  const { data: userSession } = useSession() as { data: ExtendedSession | null };
  const { company } = useParams() as { company: string };
  const {
    messages,
    currentMessage,
    isLoading,
    loadingMessages,
    sessionId,
    isVoiceResponseEnabled,
    setMessages,
    setCurrentMessage,
    setIsLoading,
    setLoadingMessages,
  } = useChatContext();

  const { getCurrentSession } = useMiniChatSession();

  // Fetch messages for the current session
  const fetchMessages = useCallback(async () => {
    if (!sessionId || !userSession?.user?.id || !company) return;

    setLoadingMessages(true);
    
    try {
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company}/command-center/sessions/${sessionId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const { data, error } = await response.json();

      if (error || !data) {
        throw new Error('Failed to fetch messages');
      }

      // Transform the response to match our SessionMessage interface
      const transformedMessages = transformApiMessages(data, parseAndSplitAiResponse);
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [sessionId, company, userSession?.user.id, setMessages, setLoadingMessages]);

  // Send text message
  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || isLoading || !userSession?.user?.id || !company) return;

    // Prevent duplicate sends by immediately setting loading and clearing message
    const messageToSend = currentMessage.trim();
    setCurrentMessage('');
    setIsLoading(true);

    // Get or create session
    const currentSessionId = sessionId || await getCurrentSession(messageToSend);
    if (!currentSessionId) {
      console.error('Failed to get or create session');
      setCurrentMessage(messageToSend); // Restore message on error
      setIsLoading(false);
      return;
    }

    // Create optimistic user message
    const userMessage = createOptimisticMessage(messageToSend, currentSessionId, 'text');

    // Add user message immediately for optimistic UI
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company}/command-center/sessions/${currentSessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_prompt: messageToSend,
          user_content_type: 'text',
          audioResponse: isVoiceResponseEnabled,
        })
      });

      if (!response.ok) {
        // Remove the optimistic user message on failure
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        throw new Error('Failed to send message');
      }

      const { response: aiResponse, response_id, user_message_id, aiAudioResponse, toolCalls } = await response.json();

      // Parse AI response and split tool results into separate messages
      const parsedMessages = parseAndSplitAiResponse(aiResponse, response_id, currentSessionId, toolCalls);

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
            onStart: () => console.log('🔊 Playing AI audio response for text message'),
            onError: (error) => console.error('🔊 Failed to play AI audio response:', error),
          });
        } catch (error) {
          console.error('🔊 Audio playback error for text message:', error);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the optimistic user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      // Restore the message text
      setCurrentMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }
  }, [currentMessage, isLoading, userSession?.user?.id, company, sessionId, isVoiceResponseEnabled, getCurrentSession, setMessages, setCurrentMessage, setIsLoading]);

  // Load messages when session is available
  useEffect(() => {
    if (sessionId && !isLoading) {
      fetchMessages();
    }
  }, [sessionId, fetchMessages, isLoading]);

  return {
    // State
    messages,
    currentMessage,
    isLoading,
    loadingMessages,
    
    // Actions
    handleSendMessage,
    setCurrentMessage,
    fetchMessages,
  };
};