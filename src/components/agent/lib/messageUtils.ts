import { SessionMessage } from './types';

/**
 * Parse AI response and split tool results into separate messages
 */
export const parseAndSplitAiResponse = (
  aiResponse: string, 
  responseId: string, 
  sessionId: string
): SessionMessage[] => {
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
};

/**
 * Create an optimistic user message for immediate UI updates
 */
export const createOptimisticMessage = (
  content: string,
  sessionId: string,
  contentType: 'text' | 'audio' = 'text'
): SessionMessage => ({
  id: crypto.randomUUID(),
  session_id: sessionId,
  content,
  sender: 'user',
  content_type: contentType,
  created_at: new Date().toISOString()
});

/**
 * Transform API messages to SessionMessage format and handle tool result splitting
 */
export const transformApiMessages = (
  apiMessages: any[],
  parseAndSplit: typeof parseAndSplitAiResponse
): SessionMessage[] => {
  const transformedMessages: SessionMessage[] = [];
  
  apiMessages.forEach((message: any) => {
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
      const parsedMessages = parseAndSplit(message.content, message.id, message.session_id);
      transformedMessages.push(...parsedMessages);
    } else {
      transformedMessages.push(baseMessage);
    }
  });
  
  return transformedMessages;
};

/**
 * Create a tool action message for accept/reject actions
 */
export const createToolActionMessage = (
  action: 'accept' | 'reject',
  sessionId: string,
  messageId: string
): SessionMessage => ({
  id: messageId,
  session_id: sessionId,
  content: action === 'accept' ? 'yes' : 'no',
  sender: 'user' as const,
  content_type: 'text',
  created_at: new Date().toISOString()
});