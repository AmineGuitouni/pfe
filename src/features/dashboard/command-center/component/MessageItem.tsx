import React, { useMemo, useState } from 'react';
import { SessionMessage } from '../hooks/useCommandCenter';
import { User, Bot, Wrench, RotateCcw } from 'lucide-react';
import ToolUseDisplay, { ToolCall, OpenAIToolCall } from './toolUseDisplay';
import ToolResultDisplay from './toolResultDisplay';
import MarkdownRenderer from './MarkdownRenderer';
import AudioMessage from './AudioMessage';
import { useCommandCenterContext } from '../context/CommandCenterContext';

interface ParsedMessage {
  textBefore: string;
  toolCall?: ToolCall;
  textAfter: string;
  rawText: string;
  toolCalls?: OpenAIToolCall[]; // New: array of tool calls from OpenAI format
}

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
  if (beforeIndex >= 0) {
    return { textBefore: text.slice(0, beforeIndex), toolCall: undefined, textAfter: '', rawText: text };
  }
  return { textBefore: text, toolCall: undefined, textAfter: '', rawText: text };
};

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

interface ParsedToolResult {
  toolName: string;
  output?: any;
  error?: string | { message: string; [key: string]: any };
  rawJsonString: string; // The original JSON string from the ```tool_result ... ``` block
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
        // It must have either 'output' or 'error'
        (!parsedJson.hasOwnProperty('output') && !parsedJson.hasOwnProperty('error'))
      ) {
        console.warn("Parsed tool_result JSON has an unexpected structure:", parsedJson);
        return undefined; // Indicates parsing failure or invalid structure
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
      return undefined; // Indicates parsing failure
    }
  }
  return undefined; // No ```tool_result``` block found
};


interface MessageItemProps {
  message: SessionMessage;
  isLast?: boolean;
  showRetryButton?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isLast, showRetryButton = false }) => {
  const isUser = message.sender === 'user';
  const isAi = message.sender === 'ai';
  const isTool = message.sender === 'tool';
  const [isHovered, setIsHovered] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const {toolCallAction, retryLastMessage, sendingMessage} = useCommandCenterContext();

  // Handle retry functionality
  const handleRetry = async () => {
    if (isRetrying || sendingMessage) return;
    
    setIsRetrying(true);
    try {
      const result = await retryLastMessage();
      if (result?.error) {
        console.error('Error retrying message:', result.error);
      }
    } catch (error) {
      console.error('Error retrying message:', error);
    } finally {
      setIsRetrying(false);
    }
  };

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

  // Determine avatar and alignment
  const showAvatar = !isUser; // User messages don't have an avatar on the left
  const avatarIcon = isAi ? <Bot size={20} className="text-light_blue" /> :
                     isTool ? <Wrench size={20} className="text-yellow-400" /> : null;
  const avatarBg = isAi ? "bg-light_blue-500/20" :
                   isTool ? "bg-yellow-600/20" : ""; // Distinct background for tool avatar

  const messageBubbleClasses = isUser
    ? 'bg-light_blue-500 text-dark_blue rounded-br-none'
    : isTool
    ? 'bg-modal_bg text-white rounded-bl-none border border-dashed border-yellow-700/80' // Special style for tool result bubble
    : 'bg-modal_bg text-white rounded-bl-none'; // AI message

  return (
    <div className={`flex items-start gap-3 my-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {showAvatar && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center`}>
          {avatarIcon}
        </div>
      )}

      <div className="relative group">
        <div
          className={`max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 rounded-lg shadow ${messageBubbleClasses}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isUser && (
            <>
              {message.content_type === 'audio' ? (
                <AudioMessage
                  audioUrl={message.content}
                  isOwnMessage={true}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </>
          )}

          {isAi && (
          <>
            {/* Handle AI audio messages */}
            {message.content_type === 'audio' ? (
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
                    onAccept={async () => {
                      await toolCallAction('accept');
                    }}
                    onReject={async () => {
                      await toolCallAction('reject');
                    }}
                    isLast={isLast}
                  />
                ))}
                
                {/* Legacy tool_use block format (for backwards compatibility) */}
                {!hasToolCalls && hasLegacyToolUse && (
                  <ToolUseDisplay
                    toolCall={parsedAiContent.toolCall}
                    onAccept={async () => {
                      await toolCallAction('accept');
                    }}
                    onReject={async () => {
                      await toolCallAction('reject');
                    }}
                    isLast={isLast}
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
            )}
          </>
        )}

        {isTool && (
          parsedToolResultContent ? (
            <ToolResultDisplay
              toolName={parsedToolResultContent.toolName}
              output={parsedToolResultContent.output}
              error={parsedToolResultContent.error}
            />
          ) : (
            // Fallback for tool message if parsing failed completely
            <div className="text-xs text-yellow-300">
              <p className="font-semibold">Malformed Tool Result</p>
              <p className="italic">Could not display tool result data.</p>
              <pre className="mt-1 text-gray-400 text-[10px] bg-black/20 p-1 rounded whitespace-pre-wrap break-all">
                {message.content}
              </pre>
            </div>
          )
        )}


        </div>

        {/* Retry button for user messages */}
        {isUser && showRetryButton && (
          <div
            className={`absolute -bottom-4 right-0 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={handleRetry}
              disabled={isRetrying || sendingMessage}
              className={`p-1.5 rounded-full shadow-md border transition-all duration-200 ${
                isRetrying || sendingMessage
                  ? 'opacity-50 cursor-not-allowed bg-modal_bg border-gray-600'
                  : 'hover:scale-105 bg-modal_bg border-light_blue-500/50 hover:border-light_blue-500'
              }`}
              title="Retry message"
            >
              <RotateCcw
                size={14}
                className={`${
                  isRetrying ? 'animate-spin text-light_blue' : 'text-light_blue-500'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
          <User size={20} className="text-gray-700 dark:text-gray-200" />
        </div>
      )}
    </div>
  );
};

export default MessageItem;