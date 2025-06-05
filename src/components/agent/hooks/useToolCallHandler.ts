'use client';

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useChatContext } from '../contexts/ChatContext';
import { parseAndSplitAiResponse, createToolActionMessage } from '../lib/messageUtils';

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
  const { sessionId, setMessages } = useChatContext();

  // Tool call action handler
  const toolCallAction = useCallback(async (action: "accept" | "reject") => {
    if (!userSession?.user?.id || !company || !sessionId) return;

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

      const { response: aiResponse, response_id, user_message_id } = await response.json();

      // Parse AI response and split tool results into separate messages
      const parsedMessages = parseAndSplitAiResponse(aiResponse, response_id, sessionId);

      // Create tool action message
      const toolActionMessage = createToolActionMessage(action, sessionId, user_message_id);

      // Add user action and parsed AI response(s)
      setMessages(prev => [
        ...prev,
        toolActionMessage,
        ...parsedMessages
      ]);

    } catch (error) {
      console.error(`Error ${action}ing tool call:`, error);
    }
  }, [userSession?.user?.id, company, sessionId, setMessages]);

  return {
    toolCallAction,
  };
};