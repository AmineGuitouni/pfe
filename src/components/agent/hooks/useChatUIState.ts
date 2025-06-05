'use client';

import { useCallback } from 'react';
import { ChatState } from '../lib/types';
import { useChatContext } from '../contexts/ChatContext';

export const useChatUIState = () => {
  const {
    chatState,
    isSessionSelectorVisible,
    isVoiceResponseEnabled,
    isLiveListening,
    setChatState,
    setIsSessionSelectorVisible,
    setIsVoiceResponseEnabled,
    setIsLiveListening,
  } = useChatContext();

  // Handle chat state changes
  const handleStateChange = useCallback((newState: ChatState) => {
    setChatState(newState);
  }, [setChatState]);

  // Toggle voice response
  const toggleVoiceResponse = useCallback(() => {
    setIsVoiceResponseEnabled(!isVoiceResponseEnabled);
  }, [isVoiceResponseEnabled, setIsVoiceResponseEnabled]);

  // Toggle live listening
  const toggleLiveListening = useCallback(() => {
    setIsLiveListening(!isLiveListening);
  }, [isLiveListening, setIsLiveListening]);

  // Session selector handlers
  const showSessionSelector = useCallback(() => {
    setIsSessionSelectorVisible(true);
  }, [setIsSessionSelectorVisible]);

  const hideSessionSelector = useCallback(() => {
    setIsSessionSelectorVisible(false);
  }, [setIsSessionSelectorVisible]);

  return {
    // State
    chatState,
    isSessionSelectorVisible,
    isVoiceResponseEnabled,
    isLiveListening,
    
    // Actions
    handleStateChange,
    toggleVoiceResponse,
    toggleLiveListening,
    showSessionSelector,
    hideSessionSelector,
  };
};