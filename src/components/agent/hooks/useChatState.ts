'use client';

import { useState, useCallback } from 'react';
import { Message, ChatState } from '../lib/types';
import { CHAT_CONFIG } from '../lib/constants';

export const useChatState = () => {
  const [chatState, setChatState] = useState<ChatState>('icon');
  const [messages, setMessages] = useState<Message[]>([...CHAT_CONFIG.DEMO_MESSAGES]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceResponseEnabled, setIsVoiceResponseEnabled] = useState(false);
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleStateChange = useCallback((newState: ChatState) => {
    setChatState(newState);
  }, []);

  const toggleVoiceResponse = useCallback(() => {
    setIsVoiceResponseEnabled(prev => !prev);
  }, []);

  const toggleLiveListening = useCallback(() => {
    setIsLiveListening(prev => !prev);
  }, []);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    // TODO: Implement actual audio recording logic
    console.log('Starting audio recording...');
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    // TODO: Implement actual audio recording stop logic and send as message
    console.log('Stopping audio recording...');
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: CHAT_CONFIG.DEMO_RESPONSE,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      setIsTyping(false);
    }, CHAT_CONFIG.RESPONSE_DELAY);
  }, [currentMessage, isLoading]);

  return {
    chatState,
    messages,
    currentMessage,
    isLoading,
    isTyping,
    isVoiceResponseEnabled,
    isLiveListening,
    isRecording,
    handleStateChange,
    handleSendMessage,
    setCurrentMessage,
    toggleVoiceResponse,
    toggleLiveListening,
    startRecording,
    stopRecording
  };
};
