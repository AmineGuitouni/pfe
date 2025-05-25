import React, { useMemo } from 'react';
import { SessionMessage } from '../hooks/useCommandCenter';
import { User, Bot, Wrench } from 'lucide-react'; // Added Wrench for tool results
import ToolUseDisplay, { ToolCall } from './toolUseDisplay';
import ToolResultDisplay from './toolResultDisplay'; // Import the new component

interface ParsedMessage {
  textBefore: string;
  toolCall?: ToolCall;
  textAfter: string;
  rawText: string;
}

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
        typeof parsedJson.parameters !== 'object' || // parameters can be an empty object
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
      // On error, return the full text as 'textBefore' to display it, and no toolCall.
      // ToolUseDisplay will handle toolCall: undefined as a loading/error state.
      return { textBefore: text, toolCall: undefined, textAfter: '', rawText: text };
    }
  }
  
  const boforIndex = text.indexOf('```tool_use');
  return { textBefore: text.slice(0, boforIndex), toolCall: undefined, textAfter: '', rawText: text };
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
        typeof parsedJson.tool_name !== 'string' ||
        // It must have either 'output' or 'error'
        (!parsedJson.hasOwnProperty('output') && !parsedJson.hasOwnProperty('error'))
      ) {
        console.warn("Parsed tool_result JSON has an unexpected structure:", parsedJson);
        return undefined; // Indicates parsing failure or invalid structure
      }
      return {
        toolName: parsedJson.tool_name,
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
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isAi = message.sender === 'ai';
  const isTool = message.sender === 'tool';

  // Memoize parsing results
  const parsedAiContent = useMemo(() => {
    if (isAi) { // Always parse AI messages in case they contain tool_use or just text
      return parseMessageWithToolUse(message.content);
    }
    // Return a default structure if not AI, ensuring properties exist
    return { textBefore: "", toolCall: undefined, textAfter: '', rawText: "" };
  }, [message.content, isAi]);

  const parsedToolResultContent = useMemo(() => {
    if (isTool) {
      return parseMessageWithToolResult(message.content);
    }
    return undefined;
  }, [message.content, isTool]);

  const hasActualTextBeforeAi = parsedAiContent.textBefore?.trim().length > 0;
  const hasActualTextAfterAi = parsedAiContent.textAfter?.trim().length > 0;

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

      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 rounded-lg shadow ${messageBubbleClasses}`}
      >
        {isUser && (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}

        {isAi && (
          <>
            {/* Render text before tool_use block if it exists and tool_use is parsed */}
            {parsedAiContent.toolCall && hasActualTextBeforeAi && (
              <p className="text-sm whitespace-pre-wrap mb-1">{parsedAiContent.textBefore.trim()}</p>
            )}
            {/* Render ToolUseDisplay if a tool_use block is parsed (valid or not, ToolUseDisplay handles undefined) */}
            {/* ToolUseDisplay will show loading/error if toolCall is undefined due to parsing error */}
            {message.content.includes('```tool_use') && (
                 <ToolUseDisplay toolCall={parsedAiContent.toolCall} />
            )}
            {/* Render text after tool_use block if it exists and tool_use is parsed */}
            {parsedAiContent.toolCall && hasActualTextAfterAi && (
              <p className="text-sm whitespace-pre-wrap mt-1">{parsedAiContent.textAfter.trim()}</p>
            )}
            {/* If no tool_use block was intended or if it was completely unparsable leading to no toolCall, render raw text */}
            {/* This also covers AI messages that are purely text */}
            {!message.content.includes('```tool_use') && (
                 <p className="text-sm whitespace-pre-wrap">{parsedAiContent.rawText}</p>
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

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
          <User size={20} className="text-gray-700 dark:text-gray-200" />
        </div>
      )}
    </div>
  );
};

export default MessageItem;