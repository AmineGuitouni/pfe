'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';

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

interface MiniChatSessionData {
  sessionId: string | null;
  isCreatingSession: boolean;
  error: string | null;
}

export const useMiniChatSession = () => {
  const { data: userSession } = useSession() as { data: ExtendedSession | null };
  const { company } = useParams() as { company: string };
  const router = useRouter();
  
  const [sessionData, setSessionData] = useState<MiniChatSessionData>({
    sessionId: null,
    isCreatingSession: false,
    error: null
  });

  // Get stored session ID for mini chat
  const getStoredSessionId = useCallback(() => {
    if (!company) return null;
    return localStorage.getItem(`miniChat_sessionId_${company}`);
  }, [company]);

  // Store session ID for mini chat
  const storeSessionId = useCallback((sessionId: string) => {
    if (!company) return;
    localStorage.setItem(`miniChat_sessionId_${company}`, sessionId);
  }, [company]);

  // Clear stored session ID
  const clearStoredSessionId = useCallback(() => {
    if (!company) return;
    localStorage.removeItem(`miniChat_sessionId_${company}`);
  }, [company]);

  // Create a new chat session
  const createNewSession = useCallback(async (initialMessage?: string): Promise<string | null> => {
    if (!userSession?.user?.id || !company) {
      setSessionData(prev => ({ ...prev, error: 'Missing user session or company' }));
      return null;
    }

    setSessionData(prev => ({ ...prev, isCreatingSession: true, error: null }));

    try {
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company}/command-center/sessions/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: initialMessage ? `${initialMessage.slice(0, 20)}...` : 'Mini Chat Session',
          mode: 'chat' // Always use chat mode for mini chat
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const { data, error } = await response.json();

      if (error || !data) {
        throw new Error(error || 'Failed to create session');
      }

      const newSessionId = data.session_id;
      storeSessionId(newSessionId);
      
      setSessionData(prev => ({
        ...prev,
        sessionId: newSessionId,
        isCreatingSession: false
      }));

      return newSessionId;
    } catch (error) {
      console.error('Error creating mini chat session:', error);
      setSessionData(prev => ({
        ...prev,
        isCreatingSession: false,
        error: error instanceof Error ? error.message : 'Failed to create session'
      }));
      return null;
    }
  }, [userSession?.user?.id, company, storeSessionId]);

  // Get current session or create new one
  const getCurrentSession = useCallback(async (initialMessage?: string): Promise<string | null> => {
    // First check if we have a stored session
    const storedSessionId = getStoredSessionId();
    
    if (storedSessionId) {
      setSessionData(prev => ({ ...prev, sessionId: storedSessionId }));
      return storedSessionId;
    }

    // Create new session if none exists
    return await createNewSession(initialMessage);
  }, [getStoredSessionId, createNewSession]);

  // Navigate to full command center with current session
  const navigateToCommandCenter = useCallback(() => {
    if (sessionData.sessionId && company) {
      router.push(`/dashboard/${company}/command-center/chat/${sessionData.sessionId}`);
    }
  }, [sessionData.sessionId, company, router]);

  // Reset session (for new conversation)
  const resetSession = useCallback(() => {
    clearStoredSessionId();
    setSessionData({
      sessionId: null,
      isCreatingSession: false,
      error: null
    });
  }, [clearStoredSessionId]);

  // Switch to existing session
  const switchToSession = useCallback((sessionId: string) => {
    storeSessionId(sessionId);
    setSessionData(prev => ({
      ...prev,
      sessionId,
      error: null
    }));
  }, [storeSessionId]);

  // Initialize session on mount if company is available
  useEffect(() => {
    if (company && userSession?.user?.id) {
      const storedSessionId = getStoredSessionId();
      if (storedSessionId) {
        setSessionData(prev => ({ ...prev, sessionId: storedSessionId }));
      }
    }
  }, [company, userSession?.user?.id, getStoredSessionId]);

  return {
    sessionId: sessionData.sessionId,
    isCreatingSession: sessionData.isCreatingSession,
    error: sessionData.error,
    getCurrentSession,
    createNewSession,
    navigateToCommandCenter,
    resetSession,
    switchToSession
  };
};