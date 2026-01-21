'use client';

import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, Wrench, RotateCcw } from 'lucide-react';
import { TypingIndicator } from './TypingIndicator';
import { ToolUseDisplay, ToolCall, OpenAIToolCall } from './ToolUseDisplay';
import { ToolResultDisplay } from './ToolResultDisplay';
import { AudioMessage } from './AudioMessage';
import MarkdownRenderer from '../../../dashboard/command-center/component/MarkdownRenderer';
import { MessageListProps, SessionMessage } from '../../lib/types';
import { STYLING } from '../../lib/constants';

// Add tool action handler type
interface ToolActionHandlerProps {
  toolCallAction?: (action: "accept" | "reject") => Promise<void>;
  isAutoAcceptEnabled?: boolean;
  retryLastMessage?: () => Promise<{ error: string; } | undefined>;
  isRetrying?: boolean;
}

interface ParsedMessage {
  textBefore: string;
  toolCall?: ToolCall;
  textAfter: string;
  rawText: string;
  toolCalls?: OpenAIToolCall[]; // New: array of tool calls from OpenAI format
}

/**
 * Parse tool_calls from message (new OpenAI format)
 */
const parseToolCallsFromMessage = (message: SessionMessage): OpenAIToolCall[] | undefined => {
  if (!message.tool_calls) return undefined;
  
  // Handle string (from database JSON) or object
  if (typeof message.tool_calls === 'string') {
    try {
      return JSON.parse(message.tool_calls);
    } catch (e) {
      console.error('Failed to parse tool_calls JSON:', e);
      return undefined;
    }
  }
  
  return message.tool_calls as OpenAIToolCall[];
};

/**
 * Legacy parser for ```tool_use``` blocks in message content
 * @deprecated This is kept for backwards compatibility with old messages
 */
const parseMessageWithToolUse = (text: string): ParsedMessage => {
  const toolUseRegex = /```tool_use\s*([\s\S]*?)\s*```/;
  const match = text.match(toolUseRegex);

  if (match && typeof match.index === 'number' && typeof match[1] === 'string') {
    const toolCallJsonString = match[1];
    const startIndex = match.index;
    const blockLength = match[0].length;

    try {
      const parsedJson = JSON.parse(toolCallJsonString);
      if (
        typeof parsedJson !== 'object' ||
        parsedJson === null ||
        typeof parsedJson.name !== 'string' ||
        typeof parsedJson.parameters !== 'object' ||
        parsedJson.parameters === null
      ) {
        console.warn("Parsed tool_use JSON has an unexpected structure:", parsedJson);
        throw new Error("Parsed tool_use JSON has an unexpected structure");
      }
      const parsedToolCall = parsedJson as ToolCall;
      const textBefore = text.substring(0, startIndex);
      const textAfter = text.substring(startIndex + blockLength);
      
      return { textBefore, toolCall: parsedToolCall, textAfter, rawText: text };
    } catch (error) {
      console.error(
        "Failed to parse or validate tool_use JSON:", error,
        "\nJSON string was:", toolCallJsonString,
        "\nOriginal text:", text
      );
      return { textBefore: text, toolCall: undefined, textAfter: '', rawText: text };
    }
  }
  
  const beforeIndex = text.indexOf('```tool_use');
  return { textBefore: text.slice(0, beforeIndex), toolCall: undefined, textAfter: '', rawText: text };
};

interface ParsedToolResult {
  toolName: string;
  output?: any;
  error?: string | { message: string; [key: string]: any };
  rawJsonString: string;
}

const parseMessageWithToolResult = (text: string): ParsedToolResult | undefined => {
  const toolResultRegex = /```tool_result\s*([\s\S]*?)\s*```/;
  const match = text.match(toolResultRegex);

  if (match && typeof match[1] === 'string') {
    const toolResultJsonString = match[1];
    try {
      const parsedJson = JSON.parse(toolResultJsonString);
      if (
        typeof parsedJson !== 'object' ||
        parsedJson === null ||
        typeof parsedJson.name !== 'string' ||
        (!parsedJson.hasOwnProperty('output') && !parsedJson.hasOwnProperty('error'))
      ) {
        console.warn("Parsed tool_result JSON has an unexpected structure:", parsedJson);
        return undefined;
      }
      return {
        toolName: parsedJson.name,
        output: parsedJson.output,
        error: parsedJson.error,
        rawJsonString: toolResultJsonString,
      };
    } catch (error) {
      console.error(
        "Failed to parse tool_result JSON:", error,
        "\nJSON string was:", toolResultJsonString,
        "\nOriginal text:", text
      );
      return undefined;
    }
  }
  return undefined;
};

interface MessageItemProps {
  message: SessionMessage;
  index: number;
  isLast?: boolean;
  toolCallAction?: (action: "accept" | "reject") => Promise<void>;
  isAutoAcceptEnabled?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => Promise<{ error: string; } | undefined>;
  isRetrying?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  isLast = false,
  toolCallAction,
  isAutoAcceptEnabled = false,
  showRetryButton = false,
  onRetry,
  isRetrying = false
}) => {
  const isUser = message.sender === 'user';
  const isAi = message.sender === 'ai';
  const isTool = message.sender === 'tool';
  const [isHovered, setIsHovered] = useState(false);

  // Handle retry functionality
  const handleRetry = useCallback(async () => {
    if (isRetrying || !onRetry) return;
    
    try {
      await onRetry();
    } catch (error) {
      console.error('Error retrying message:', error);
    }
  }, [isRetrying, onRetry]);

  // Memoize parsing results
  const parsedAiContent = useMemo(() => {
    if (isAi) {
      // First check for new OpenAI tool_calls format
      const toolCalls = parseToolCallsFromMessage(message);
      if (toolCalls && toolCalls.length > 0) {
        return { 
          textBefore: message.content || '', 
          toolCall: undefined, 
          textAfter: '', 
          rawText: message.content || '',
          toolCalls 
        };
      }
      // Fall back to legacy ```tool_use``` parsing for old messages
      return parseMessageWithToolUse(message.content);
    }
    return { textBefore: "", toolCall: undefined, textAfter: '', rawText: "", toolCalls: undefined };
  }, [message.content, message.tool_calls, isAi]);

  const parsedToolResultContent = useMemo(() => {
    if (isTool) {
      // For new format, tool results are stored as JSON in content
      // Check if it's already a tool result object (new format)
      if (message.tool_call_id) {
        try {
          const result = typeof message.content === 'string' ? JSON.parse(message.content) : message.content;
          return {
            toolName: message.tool_name || 'Unknown Tool',
            output: result.success !== false ? result : undefined,
            error: result.success === false ? result.error : undefined,
            rawJsonString: message.content,
          };
        } catch (e) {
          // If parsing fails, fall back to old parser
        }
      }
      // Fall back to legacy ```tool_result``` parsing
      return parseMessageWithToolResult(message.content);
    }
    return undefined;
  }, [message.content, message.tool_call_id, message.tool_name, isTool]);

  const hasActualTextBeforeAi = parsedAiContent.textBefore?.trim().length > 0;
  const hasActualTextAfterAi = parsedAiContent.textAfter?.trim().length > 0;
  const hasToolCalls = parsedAiContent.toolCalls && parsedAiContent.toolCalls.length > 0;
  const hasLegacyToolUse = message.content?.includes('```tool_use');

  // Determine avatar and styling
  const showAvatar = !isUser;
  const avatarIcon = isAi ? <Bot size={16} className={STYLING.COLORS.TEXT_PRIMARY} /> :
                     isTool ? <Wrench size={16} className="text-orange-400" /> : null;
  const avatarBg = isAi ? `${STYLING.COLORS.AI_MESSAGE}` :
                   isTool ? "bg-orange-400/20" : "";

  const messageBubbleClasses = isUser
    ? `${STYLING.COLORS.USER_MESSAGE} ${STYLING.COLORS.BUTTON_TEXT} rounded-br-lg`
    : isTool
    ? `${STYLING.COLORS.AI_MESSAGE} ${STYLING.COLORS.TEXT_PRIMARY} rounded-bl-lg border-l-4 border-orange-400/60`
    : `${STYLING.COLORS.AI_MESSAGE} ${STYLING.COLORS.TEXT_PRIMARY} rounded-bl-lg`;

  const renderMessageContent = () => {
    if (isUser) {
      return message.content_type === 'audio' ? (
        <AudioMessage
          audioUrl={message.content}
          isOwnMessage={true}
        />
      ) : (
        <div className="text-sm whitespace-pre-wrap">
          {message.content}
        </div>
      );
    }

    if (isAi) {
      return message.content_type === 'audio' ? (
        <AudioMessage
          audioUrl={message.content}
          isOwnMessage={false}
        />
      ) : (
        <>
          {/* Render text content if exists */}
          {hasActualTextBeforeAi && (
            <MarkdownRenderer
              content={parsedAiContent.textBefore.trim()}
              className="mb-1"
            />
          )}
          
          {/* New OpenAI Tool Calls Format */}
          {hasToolCalls && parsedAiContent.toolCalls?.map((toolCall, index) => (
            <ToolUseDisplay
              key={toolCall.id || index}
              toolCall={toolCall}
              isLast={isLast}
              isAutoAcceptEnabled={isAutoAcceptEnabled}
              onAccept={toolCallAction ? () => toolCallAction('accept') : undefined}
              onReject={toolCallAction ? () => toolCallAction('reject') : undefined}
            />
          ))}
          
          {/* Legacy tool_use block format (for backwards compatibility) */}
          {!hasToolCalls && hasLegacyToolUse && (
            <ToolUseDisplay
              toolCall={parsedAiContent.toolCall}
              isLast={isLast}
              isAutoAcceptEnabled={isAutoAcceptEnabled}
              onAccept={toolCallAction ? () => toolCallAction('accept') : undefined}
              onReject={toolCallAction ? () => toolCallAction('reject') : undefined}
            />
          )}
          
          {/* Render text after tool_use block (legacy format) */}
          {parsedAiContent.toolCall && hasActualTextAfterAi && (
            <MarkdownRenderer
              content={parsedAiContent.textAfter.trim()}
              className="mt-1"
            />
          )}
          
          {/* Pure text AI message (no tool calls) */}
          {!hasToolCalls && !hasLegacyToolUse && (
            <MarkdownRenderer
              content={parsedAiContent.rawText}
            />
          )}
        </>
      );
    }

    if (isTool) {
      return parsedToolResultContent ? (
        <ToolResultDisplay
          toolName={parsedToolResultContent.toolName}
          output={parsedToolResultContent.output}
          error={parsedToolResultContent.error}
        />
      ) : (
        // Fallback for tool message if parsing failed
        <div className="text-xs text-orange-300">
          <p className="font-semibold">Malformed Tool Result</p>
          <p className="italic">Could not display tool result data.</p>
          <pre className={`mt-1 ${STYLING.COLORS.TEXT_SECONDARY} text-[10px] ${STYLING.COLORS.AI_MESSAGE} p-1 rounded whitespace-pre-wrap break-all`}>
            {message.content}
          </pre>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }}
      className={`flex items-start gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {showAvatar && (
        <div className={`flex-shrink-0 w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center border border-white/10`}>
          {avatarIcon}
        </div>
      )}

      <div
        className="relative group max-w-[80%]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`px-4 py-2 rounded-2xl shadow-lg ${messageBubbleClasses}`}>
          {renderMessageContent()}
        </div>
        
        {/* Retry button for user messages */}
        {isUser && showRetryButton && (
          <div
            className={`absolute -bottom-2 right-0 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`p-1.5 rounded-full shadow-md border transition-all duration-200 ${
                isRetrying
                  ? 'opacity-50 cursor-not-allowed bg-gray-600/20 border-gray-600'
                  : 'hover:scale-105 bg-gray-800/80 border-light_blue/50 hover:border-light_blue backdrop-blur-sm'
              }`}
              title="Retry message"
            >
              <RotateCcw
                size={12}
                className={`${
                  isRetrying ? 'animate-spin text-light_blue' : 'text-light_blue/80 hover:text-light_blue'
                }`}
              />
            </button>
          </div>
        )}
        
        {/* Timestamp on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-400 mt-1 px-2">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>

      {isUser && (
        <div className={`flex-shrink-0 w-7 h-7 rounded-full ${STYLING.COLORS.USER_MESSAGE} flex items-center justify-center border border-white/10`}>
          <User size={16} className={STYLING.COLORS.BUTTON_TEXT} />
        </div>
      )}
    </motion.div>
  );
};

export const MessageList: React.FC<MessageListProps & ToolActionHandlerProps> = ({
  messages,
  isTyping,
  toolCallAction,
  isAutoAcceptEnabled = false,
  retryLastMessage,
  isRetrying = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Show retry button only if the last message in the entire conversation is a user message
  const shouldShowRetryButton = useMemo(() => {
    if (messages.length === 0) return false;
    const lastMessage = messages[messages.length - 1];
    return lastMessage.sender === 'user';
  }, [messages]);

  const lastMessageIndex = messages.length - 1;

  return (
    <motion.div
      className={`flex-1 overflow-y-auto p-4 space-y-2 ${STYLING.COLORS.SCROLLBAR}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.05, duration: 0.15 }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.02
            }
          }
        }}
      >
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            index={index}
            isLast={index === (messages.length - 1) && !isTyping}
            toolCallAction={toolCallAction}
            isAutoAcceptEnabled={isAutoAcceptEnabled}
            showRetryButton={index === lastMessageIndex && shouldShowRetryButton && retryLastMessage !== undefined}
            onRetry={retryLastMessage}
            isRetrying={isRetrying}
          />
        ))}
        <AnimatePresence>
          <TypingIndicator isVisible={isTyping} />
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </motion.div>
    </motion.div>
  );
};
