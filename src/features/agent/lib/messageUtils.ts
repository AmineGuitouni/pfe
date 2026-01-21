import { SessionMessage } from './types';

/**
 * OpenAI Tool Call format
 */
export interface OpenAIToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

/**
 * Parse AI response and split tool results into separate messages
 * Now also handles OpenAI tool_calls array
 */
export const parseAndSplitAiResponse = (
  aiResponse: string, 
  responseId: string, 
  sessionId: string,
  toolCalls?: OpenAIToolCall[] | null
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
      content: aiResponse || '',
      sender: 'ai' as const,
      content_type: 'text',
      created_at: new Date().toISOString(),
      tool_calls: toolCalls || undefined // Include tool_calls if present
    });
  } else {
    // Use the original response ID for the first message
    if (messages.length > 0) {
      messages[0].id = responseId;
      // Add tool_calls to the first AI message if present
      if (toolCalls && toolCalls.length > 0) {
        messages[0].tool_calls = toolCalls;
      }
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
 * Now also handles OpenAI tool_calls format
 */
export const transformApiMessages = (
  apiMessages: any[],
  parseAndSplit: typeof parseAndSplitAiResponse
): SessionMessage[] => {
  const transformedMessages: SessionMessage[] = [];
  
  apiMessages.forEach((message: any) => {
    // Parse tool_calls if it's a string
    let toolCalls = message.tool_calls;
    if (typeof toolCalls === 'string') {
      try {
        toolCalls = JSON.parse(toolCalls);
      } catch (e) {
        toolCalls = null;
      }
    }

    const baseMessage: SessionMessage = {
      id: message.id,
      session_id: message.session_id,
      sender: message.sender,
      content: message.content,
      content_type: message.type || 'text',
      created_at: message.created_at,
      tool_calls: toolCalls || undefined,
      tool_call_id: message.tool_call_id || undefined,
      tool_name: message.tool_name || undefined
    };

    // If it's an AI message with legacy tool results, split them
    if (message.sender === 'ai' && message.content?.includes('```tool_result')) {
      const parsedMessages = parseAndSplit(message.content, message.id, message.session_id, toolCalls);
      transformedMessages.push(...parsedMessages);
    } else {
      transformedMessages.push(baseMessage);
    }
  });
  
  return transformedMessages;
};