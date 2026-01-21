'use client';

import { useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChatContext } from '../contexts/ChatContext';
import { SessionMessage } from '../lib/types';

/**
 * Helper function to check if a message has pending tool calls
 */
const hasPendingToolCalls = (message: SessionMessage | undefined): boolean => {
  if (!message || message.sender !== 'ai') return false;
  
  // New format: check tool_calls field
  if (message.tool_calls) {
    try {
      const toolCalls = typeof message.tool_calls === 'string' 
        ? JSON.parse(message.tool_calls) 
        : message.tool_calls;
      return Array.isArray(toolCalls) && toolCalls.length > 0;
    } catch (e) {
      console.error('Error parsing tool_calls:', e);
    }
  }
  
  // Legacy format: check for ```tool_use``` in content
  return message.content?.includes('```tool_use') ?? false;
};

export const useAutoAccept = () => {
  const { company } = useParams() as { company: string };
  const {
    isAutoAcceptEnabled,
    messages,
    isLoading,
    setIsAutoAcceptEnabled,
  } = useChatContext();

  // Load auto accept setting from localStorage on mount
  useEffect(() => {
    if (company) {
      const stored = localStorage.getItem(`miniChat_autoAccept_${company}`);
      if (stored) {
        setIsAutoAcceptEnabled(JSON.parse(stored));
      }
    }
  }, [company, setIsAutoAcceptEnabled]);

  // Toggle auto accept and persist to localStorage
  const toggleAutoAccept = useCallback(() => {
    const newValue = !isAutoAcceptEnabled;
    setIsAutoAcceptEnabled(newValue);
    
    if (company) {
      localStorage.setItem(`miniChat_autoAccept_${company}`, JSON.stringify(newValue));
    }
  }, [isAutoAcceptEnabled, setIsAutoAcceptEnabled, company]);

  // Check if the last message contains tool calls that should be auto-accepted
  const shouldAutoAccept = useCallback((): boolean => {
    if (!isAutoAcceptEnabled || isLoading) return false;

    const lastMessage = messages[messages.length - 1];
    return hasPendingToolCalls(lastMessage);
  }, [isAutoAcceptEnabled, isLoading, messages]);

  return {
    // State
    isAutoAcceptEnabled,
    
    // Actions
    toggleAutoAccept,
    shouldAutoAccept,
  };
};