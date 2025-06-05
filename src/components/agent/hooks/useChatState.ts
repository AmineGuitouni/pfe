'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { ChatState, SessionMessage } from '../lib/types';
import { useMiniChatSession } from './useMiniChatSession';

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

export const useChatState = () => {
  const { data: userSession } = useSession() as { data: ExtendedSession | null };
  const { company } = useParams() as { company: string };
  
  // Mini chat session management
  const {
    sessionId,
    getCurrentSession,
    navigateToCommandCenter,
    resetSession,
    switchToSession,
    error: sessionError
  } = useMiniChatSession();

  // Visual state management (preserve existing behavior)
  const [chatState, setChatState] = useState<ChatState>('icon');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVoiceResponseEnabled, setIsVoiceResponseEnabled] = useState(false);
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAutoAcceptEnabled, setIsAutoAcceptEnabled] = useState(false);
  
  // Audio recording state and refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Session selector state
  const [isSessionSelectorVisible, setIsSessionSelectorVisible] = useState(false);

  // Message and loading state - now using SessionMessage format
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isToolCallLoading, setIsToolCallLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Load auto accept setting from localStorage on mount
  useEffect(() => {
    if (company) {
      const stored = localStorage.getItem(`miniChat_autoAccept_${company}`);
      if (stored) {
        setIsAutoAcceptEnabled(JSON.parse(stored));
      }
    }
  }, [company]);

  // Helper function to parse and split AI responses with tool results
  const parseAndSplitAiResponse = useCallback((aiResponse: string, responseId: string, sessionId: string) => {
    const toolResultRegex = /```tool_result\s*([\s\S]*?)\s*```/g;
    const messages: SessionMessage[] = [];
    let lastIndex = 0;
    let match;

    while ((match = toolResultRegex.exec(aiResponse)) !== null) {
      const beforeToolResult = aiResponse.substring(lastIndex, match.index).trim();
      
      // Add text before tool result as AI message if it exists
      if (beforeToolResult) {
        messages.push({
          id: crypto.randomUUID(),
          session_id: sessionId,
          content: beforeToolResult,
          sender: 'ai' as const,
          content_type: 'text',
          created_at: new Date().toISOString()
        });
      }

      // Add tool result as separate message
      messages.push({
        id: crypto.randomUUID(),
        session_id: sessionId,
        content: match[0], // Full ```tool_result...``` block
        sender: 'tool' as const,
        content_type: 'text',
        created_at: new Date().toISOString()
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last tool result as AI message
    const afterLastToolResult = aiResponse.substring(lastIndex).trim();
    if (afterLastToolResult) {
      messages.push({
        id: crypto.randomUUID(),
        session_id: sessionId,
        content: afterLastToolResult,
        sender: 'ai' as const,
        content_type: 'text',
        created_at: new Date().toISOString()
      });
    }

    // If no tool results found, return original AI message
    if (messages.length === 0) {
      messages.push({
        id: responseId,
        session_id: sessionId,
        content: aiResponse,
        sender: 'ai' as const,
        content_type: 'text',
        created_at: new Date().toISOString()
      });
    } else {
      // Use the original response ID for the first message
      if (messages.length > 0) {
        messages[0].id = responseId;
      }
    }

    return messages;
  }, []);

  const handleStateChange = useCallback((newState: ChatState) => {
    setChatState(newState);
  }, []);

  const toggleVoiceResponse = useCallback(() => {
    setIsVoiceResponseEnabled(prev => !prev);
  }, []);

  const toggleLiveListening = useCallback(() => {
    setIsLiveListening(prev => !prev);
  }, []);

  const toggleAutoAccept = useCallback(() => {
    setIsAutoAcceptEnabled(prev => {
      const newValue = !prev;
      if (company) {
        localStorage.setItem(`miniChat_autoAccept_${company}`, JSON.stringify(newValue));
      }
      return newValue;
    });
  }, [company]);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1
        }
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      // Create MediaRecorder instance
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav'
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      if (!selectedMimeType) {
        throw new Error('No supported audio format found');
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          if (audioChunksRef.current.length === 0) {
            console.warn('No audio data recorded');
            return;
          }
          
          console.log('Creating audio blob:', {
            chunksCount: audioChunksRef.current.length,
            totalSize: audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0),
            selectedMimeType
          });
          
          // Create blob from recorded chunks
          const audioBlob = new Blob(audioChunksRef.current, {
            type: selectedMimeType
          });
          
          console.log('Audio blob created:', {
            size: audioBlob.size,
            type: audioBlob.type
          });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            let audioData = reader.result as string;
            
            // Debug logging to see what format we're getting
            console.log('Audio data format check:', {
              hasResult: !!audioData,
              startsWithData: audioData?.startsWith('data:'),
              length: audioData?.length,
              preview: audioData?.substring(0, 100),
              fullPreview: audioData?.substring(0, 200)
            });
            
            // Check if we have valid data at all
            if (!audioData || typeof audioData !== 'string') {
              console.error('No valid base64 data generated from audio blob');
              alert('Failed to process recorded audio. Please try again.');
              return;
            }
            
            // If the data doesn't start with "data:", something went wrong
            if (!audioData.startsWith('data:')) {
              console.error('Base64 data does not start with data URI scheme:', audioData.substring(0, 100));
              alert('Invalid audio data format. Please try recording again.');
              return;
            }
            
            // More lenient validation - check for any audio type, not just strict format
            const audioFormatRegex = /^data:audio\/([^;]+);base64,(.+)$/;
            const match = audioData.match(audioFormatRegex);
            
            if (!match) {
              console.error('Audio format validation failed:', {
                data: audioData.substring(0, 100),
                expectedFormat: 'data:audio/[type];base64,[data]'
              });
              
              // Try to fix common issues - maybe the MIME type is different
              if (audioData.startsWith('data:') && audioData.includes('base64,')) {
                console.log('Attempting to fix MIME type...');
                // Extract the base64 part and construct proper audio data URL
                const base64Part = audioData.split('base64,')[1];
                if (base64Part) {
                  audioData = `data:audio/webm;base64,${base64Part}`;
                  console.log('Corrected format:', audioData.substring(0, 50));
                } else {
                  alert('Could not extract valid audio data. Please try recording again.');
                  return;
                }
              } else {
                alert('Invalid audio format generated. Please try recording again.');
                return;
              }
            }
            
            // Send the audio message inline
            if (!userSession?.user?.id || !company) return;

            // Get or create session
            const currentSessionId = sessionId || await getCurrentSession('Audio message');
            if (!currentSessionId) {
              console.error('Failed to get or create session');
              return;
            }

            // Create optimistic user message for audio
            const userMessage: SessionMessage = {
              id: crypto.randomUUID(),
              session_id: currentSessionId,
              content: audioData,
              sender: 'user',
              content_type: 'audio',
              created_at: new Date().toISOString()
            };

            // Add user message immediately for optimistic UI
            setMessages(prev => [...prev, userMessage]);
            setIsLoading(true);

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
          };
          reader.readAsDataURL(audioBlob);
          
        } catch (error) {
          console.error('Error processing recorded audio:', error);
        } finally {
          // Cleanup
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting audio recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  }, [userSession?.user?.id, company, sessionId, getCurrentSession, parseAndSplitAiResponse]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  // Session selector handlers
  const showSessionSelector = useCallback(() => {
    setIsSessionSelectorVisible(true);
  }, []);

  const hideSessionSelector = useCallback(() => {
    setIsSessionSelectorVisible(false);
  }, []);

  const handleSessionSelect = useCallback(async (selectedSessionId: string) => {
    // Switch to the selected session
    switchToSession(selectedSessionId);
    // Clear current messages to load new session messages
    setMessages([]);
  }, [switchToSession]);

  const handleCreateNewSession = useCallback(() => {
    // Reset current session to create new one
    resetSession();
    setMessages([]);
  }, [resetSession]);

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
      const transformedMessages: SessionMessage[] = [];
      
      data.forEach((message: any) => {
        const baseMessage = {
          id: message.id,
          session_id: message.session_id,
          sender: message.sender,
          content: message.content,
          content_type: message.type,
          created_at: message.created_at
        };

        // If it's an AI message, check for tool results and split them
        if (message.sender === 'ai' && message.content.includes('```tool_result')) {
          const parsedMessages = parseAndSplitAiResponse(message.content, message.id, message.session_id);
          transformedMessages.push(...parsedMessages);
        } else {
          transformedMessages.push(baseMessage);
        }
      });
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [sessionId, company, userSession?.user.id, parseAndSplitAiResponse]);

  // Real message sending using command-center API
  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || isLoading || !userSession?.user?.id || !company) return;

    // Get or create session
    const currentSessionId = sessionId || await getCurrentSession(currentMessage);
    if (!currentSessionId) {
      console.error('Failed to get or create session');
      return;
    }

    // Create optimistic user message in SessionMessage format
    const userMessage: SessionMessage = {
      id: crypto.randomUUID(),
      session_id: currentSessionId,
      content: currentMessage,
      sender: 'user',
      content_type: 'text',
      created_at: new Date().toISOString()
    };

    // Add user message immediately for optimistic UI
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company}/command-center/sessions/${currentSessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_prompt: messageToSend,
          user_content_type: 'text',
        })
      });

      if (!response.ok) {
        // Remove the optimistic user message on failure
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        throw new Error('Failed to send message');
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
      console.error('Error sending message:', error);
      // Remove the optimistic user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      // Restore the message text
      setCurrentMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }
  }, [currentMessage, isLoading, userSession?.user?.id, company, sessionId, getCurrentSession, parseAndSplitAiResponse]);

  // Tool call action handler
  const toolCallAction = useCallback(async (action: "accept" | "reject") => {
    if (!userSession?.user?.id || !company || !sessionId) return;

    setIsToolCallLoading(true);

    try {
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company}/command-center/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accept_tool_call: action === 'accept',
          reject_tool_call: action === 'reject'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} tool call`);
      }

      const { response: aiResponse, response_id } = await response.json();

      // Parse AI response and split tool results into separate messages
      const parsedMessages = parseAndSplitAiResponse(aiResponse, response_id, sessionId);

      // Add user action and parsed AI response(s)
      setMessages(prev => [
        ...prev,
        ...parsedMessages
      ]);

    } catch (error) {
      console.error(`Error ${action}ing tool call:`, error);
    } finally {
      setIsToolCallLoading(false);
    }
  }, [userSession?.user?.id, company, sessionId, parseAndSplitAiResponse]);

  // Retry last message functionality
  const retryLastMessage = useCallback(async () => {
    if (!userSession?.user?.id || !company || !sessionId) {
      return {
        error: 'Missing required fields'
      };
    }

    setIsRetrying(true);

    try {
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company}/command-center/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Empty body - the API will process the existing last user message
        })
      });

      if (!response.ok) {
        throw new Error('Failed to retry message');
      }

      const { response: aiResponse, response_id, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Parse AI response and split tool results into separate messages
      const parsedMessages = parseAndSplitAiResponse(aiResponse, response_id, sessionId);

      // Add new AI response(s) to existing messages
      setMessages(prev => [...prev, ...parsedMessages]);

    } catch (error) {
      console.error('Error retrying message:', error);
      return {
        error: 'Failed to retry message'
      };
    } finally {
      setIsRetrying(false);
    }
  }, [userSession?.user?.id, company, sessionId, parseAndSplitAiResponse]);

  // Auto accept logic - trigger when new AI message with tool_use appears
  useEffect(() => {
    if (!isAutoAcceptEnabled || isLoading) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'ai' && lastMessage.content.includes('```tool_use')) {
      // Small delay to ensure UI is ready
      const timeoutId = setTimeout(() => {
        toolCallAction('accept');
      }, 1500); // Slightly longer delay for mini chat

      return () => clearTimeout(timeoutId);
    }
  }, [messages, isAutoAcceptEnabled, toolCallAction, isLoading]);

  // Load messages when session is available
  useEffect(() => {
    if (sessionId && !isLoading) {
      fetchMessages();
    }
  }, [sessionId, fetchMessages, isLoading]);

  // Cleanup audio resources on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Computed values
  const isTyping = useMemo(() => isLoading, [isLoading]);

  return {
    chatState,
    messages,
    currentMessage,
    isLoading,
    isTyping,
    isVoiceResponseEnabled,
    isLiveListening,
    isRecording,
    loadingMessages,
    sessionError,
    isSessionSelectorVisible,
    isToolCallLoading,
    isRetrying,
    handleStateChange,
    handleSendMessage,
    setCurrentMessage,
    toggleVoiceResponse,
    toggleLiveListening,
    startRecording,
    stopRecording,
    navigateToCommandCenter,
    showSessionSelector,
    hideSessionSelector,
    handleSessionSelect,
    handleCreateNewSession,
    sessionId,
    isAutoAcceptEnabled,
    toggleAutoAccept,
    toolCallAction,
    retryLastMessage
  };
};
