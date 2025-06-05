'use client';

import { useEffect, useMemo } from 'react';
import { useMiniChatSession } from './useMiniChatSession';
import { useChatUIState } from './useChatUIState';
import { useAutoAccept } from './useAutoAccept';
import { useToolCallHandler } from './useToolCallHandler';
import { useMessageManager } from './useMessageManager';
import { useAudioRecording } from './useAudioRecording';
import { useChatContext } from '../contexts/ChatContext';

export const useChatState = () => {
  // Get session management
  const {
    sessionId,
    navigateToCommandCenter,
    resetSession,
    switchToSession,
    error: sessionError
  } = useMiniChatSession();

  // Update context with session data
  const { setSessionId, setSessionError } = useChatContext();

  // Update context when session changes
  useEffect(() => {
    setSessionId(sessionId);
  }, [sessionId, setSessionId]);

  useEffect(() => {
    setSessionError(sessionError);
  }, [sessionError, setSessionError]);

  // Get all specialized hooks
  const uiState = useChatUIState();
  const autoAccept = useAutoAccept();
  const toolCallHandler = useToolCallHandler();
  const messageManager = useMessageManager();
  const audioRecording = useAudioRecording();

  // Session selector handlers
  const handleSessionSelect = async (selectedSessionId: string) => {
    // Switch to the selected session
    switchToSession(selectedSessionId);
    // Clear current messages to load new session messages
    messageManager.setCurrentMessage('');
  };

  const handleCreateNewSession = () => {
    // Reset current session to create new one
    resetSession();
  };

  // Auto accept logic - trigger when new AI message with tool_use appears
  useEffect(() => {
    if (autoAccept.shouldAutoAccept()) {
      // Small delay to ensure UI is ready
      const timeoutId = setTimeout(() => {
        toolCallHandler.toolCallAction('accept');
      }, 1500); // Slightly longer delay for mini chat

      return () => clearTimeout(timeoutId);
    }
  }, [messageManager.messages, autoAccept, toolCallHandler]);

  // Computed values
  const isTyping = useMemo(() => messageManager.isLoading, [messageManager.isLoading]);

  // Return the complete API
  return {
    // Visual state
    chatState: uiState.chatState,
    isSessionSelectorVisible: uiState.isSessionSelectorVisible,
    
    // Message state
    messages: messageManager.messages,
    currentMessage: messageManager.currentMessage,
    isLoading: messageManager.isLoading,
    loadingMessages: messageManager.loadingMessages,
    isTyping,
    
    // Audio state
    isVoiceResponseEnabled: uiState.isVoiceResponseEnabled,
    isLiveListening: uiState.isLiveListening,
    isRecording: audioRecording.isRecording,
    
    // Auto-accept state
    isAutoAcceptEnabled: autoAccept.isAutoAcceptEnabled,
    
    // Session state
    sessionId,
    sessionError,
    
    // UI Actions
    handleStateChange: uiState.handleStateChange,
    toggleVoiceResponse: uiState.toggleVoiceResponse,
    toggleLiveListening: uiState.toggleLiveListening,
    showSessionSelector: uiState.showSessionSelector,
    hideSessionSelector: uiState.hideSessionSelector,
    
    // Message Actions
    handleSendMessage: messageManager.handleSendMessage,
    setCurrentMessage: messageManager.setCurrentMessage,
    
    // Audio Actions
    startRecording: audioRecording.startRecording,
    stopRecording: audioRecording.stopRecording,
    
    // Session Actions
    navigateToCommandCenter,
    handleSessionSelect,
    handleCreateNewSession,
    
    // Auto-accept Actions
    toggleAutoAccept: autoAccept.toggleAutoAccept,
    
    // Tool Call Actions
    toolCallAction: toolCallHandler.toolCallAction,
  };
};