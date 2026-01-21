'use client';

import { useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChatContext } from '../contexts/ChatContext';

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

  // Check if the last message contains a tool_use that should be auto-accepted
  const shouldAutoAccept = useCallback((): boolean => {
    if (!isAutoAcceptEnabled || isLoading) return false;

    const lastMessage = messages[messages.length - 1];
    return lastMessage?.sender === 'ai' && lastMessage.content.includes('```tool_use');
  }, [isAutoAcceptEnabled, isLoading, messages]);

  return {
    // State
    isAutoAcceptEnabled,
    
    // Actions
    toggleAutoAccept,
    shouldAutoAccept,
  };
};