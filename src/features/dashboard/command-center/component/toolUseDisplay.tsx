import React, { useState, useMemo } from 'react';
import { Settings, Loader2, Check, X, Zap } from 'lucide-react';
import { useCommandCenterContext } from '../context/CommandCenterContext';

/**
 * OpenAI Tool Call format (from API response)
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
 * Parsed tool call with arguments as object (for display)
 */
export interface ParsedToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

/**
 * Legacy ToolCall format (kept for backwards compatibility)
 * @deprecated Use OpenAIToolCall instead
 */
export interface ToolCallParameter {
  type: string;
  value: string | number | boolean | object;
}

/**
 * @deprecated Use OpenAIToolCall instead
 */
export interface ToolCall {
  name: string;
  parameters: Record<string, ToolCallParameter | string | number | boolean | object>;
}

interface ToolUseDisplayProps {
  toolCall?: ToolCall | OpenAIToolCall | undefined; // Support both old and new formats
  onAccept?: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
  isLast?: boolean;
}

/**
 * Check if toolCall is in OpenAI format
 */
function isOpenAIToolCall(toolCall: any): toolCall is OpenAIToolCall {
  return toolCall && 
    typeof toolCall.id === 'string' && 
    toolCall.type === 'function' &&
    typeof toolCall.function === 'object' &&
    typeof toolCall.function.name === 'string' &&
    typeof toolCall.function.arguments === 'string';
}

/**
 * Parse OpenAI tool call to display format
 */
function parseOpenAIToolCall(toolCall: OpenAIToolCall): ParsedToolCall {
  let parsedArgs: Record<string, any> = {};
  try {
    parsedArgs = JSON.parse(toolCall.function.arguments);
  } catch (e) {
    console.error('Failed to parse tool call arguments:', e);
    parsedArgs = { _raw: toolCall.function.arguments };
  }
  return {
    id: toolCall.id,
    name: toolCall.function.name,
    arguments: parsedArgs
  };
}

const ToolUseDisplay: React.FC<ToolUseDisplayProps> = ({ toolCall, onAccept, onReject, isLast = false }) => {
  const [isAcceptLoading, setIsAcceptLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);
  const { isAutoAcceptEnabled } = useCommandCenterContext();

  // Normalize tool call to a common display format
  const normalizedToolCall = useMemo(() => {
    if (!toolCall) return null;
    
    if (isOpenAIToolCall(toolCall)) {
      const parsed = parseOpenAIToolCall(toolCall);
      return {
        name: parsed.name,
        parameters: parsed.arguments
      };
    }
    
    // Legacy format
    return {
      name: toolCall.name,
      parameters: toolCall.parameters
    };
  }, [toolCall]);

  const handleAccept = async () => {
    if (!onAccept || isAcceptLoading || isRejectLoading) return;
    
    setIsAcceptLoading(true);
    try {
      await onAccept();
    } finally {
      setIsAcceptLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || isAcceptLoading || isRejectLoading) return;
    
    setIsRejectLoading(true);
    try {
      await onReject();
    } finally {
      setIsRejectLoading(false);
    }
  };

  // 1. Handle loading state when toolCall is undefined
  if (toolCall === undefined) {
    return (
      <div className="mt-2 mb-1 p-3 border border-gray-600 rounded-lg bg-gray-700/50 shadow-md animate-pulse">
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <h4 className="font-semibold text-sm">Loading Tool Call...</h4>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="h-4 bg-gray-600 rounded w-1/4"></div>
          <div className="pl-2 space-y-1">
            <div className="h-3 bg-gray-600 rounded w-3/4"></div>
            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Check for valid normalized tool call
  if (
    !normalizedToolCall ||
    typeof normalizedToolCall.name !== 'string' ||
    !normalizedToolCall.name.trim() ||
    typeof normalizedToolCall.parameters !== 'object' ||
    normalizedToolCall.parameters === null
  ) {
    console.warn("ToolUseDisplay received incomplete or malformed toolCall prop:", toolCall);
    return (
      <div className="mt-2 mb-1 p-3 border border-yellow-500 rounded-lg bg-yellow-600/30 text-yellow-200">
        <div className="flex items-center gap-2 mb-1">
          <Settings size={18} />
          <p className="text-xs font-semibold">Tool Call Display Error</p>
        </div>
        <p className="text-xs mt-1">Could not display tool call due to invalid data structure.</p>
      </div>
    );
  }

  // 3. Render tool call details if data is valid
  return (
    <div className="mt-2 mb-1 p-3 border border-gray-600 rounded-lg bg-gray-700/50 shadow-md">
      <div className="flex items-center gap-2 text-light_blue-300 mb-2">
        <Settings size={18} />
        <h4 className="font-semibold text-sm">Tool Call: {normalizedToolCall.name}</h4>
      </div>
      {Object.keys(normalizedToolCall.parameters).length > 0 ? (
        <div className="space-y-1.5 text-xs">
          <p className="text-gray-400">Parameters:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            {Object.keys(normalizedToolCall.parameters).map((paramName) => {
              const param = normalizedToolCall.parameters[paramName];
              // Handle both formats: direct values and ToolCallParameter objects (legacy)
              const paramValue = typeof param === 'object' && param !== null && 'value' in param
                ? (param as ToolCallParameter).value
                : param;

              // Format the display value
              const displayValue = typeof paramValue === 'object' 
                ? JSON.stringify(paramValue, null, 2)
                : String(paramValue);

              return (
                <li key={paramName} className="text-gray-300">
                  <strong className="text-light_blue-400">{paramName}:</strong>
                  {(typeof displayValue === 'string' && displayValue.includes('\n')) || 
                   (typeof paramValue === 'object') ? (
                    <pre className="ml-2 mt-1 p-2 bg-gray-800 rounded text-xs whitespace-pre-wrap break-all">
                      {displayValue}
                    </pre>
                  ) : (
                    <span className="ml-1 break-all">{displayValue}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">No parameters provided.</p>
      )}
      
      {/* Action buttons or auto accept indicator at bottom right - only show if this is the last message */}
      {isLast && (
        <div className="flex justify-end mt-3 pt-2 border-t border-gray-600">
          {isAutoAcceptEnabled ? (
            <div className="flex items-center gap-2 px-2 py-1 text-xs bg-green-600/30 text-green-400 rounded">
              <Zap size={14} />
              Auto Accept Enabled
            </div>
          ) : (
            (onAccept || onReject) && (
              <div className="flex items-center gap-2">
                {onReject && (
                  <button
                    onClick={handleReject}
                    disabled={isAcceptLoading || isRejectLoading}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded transition-colors duration-200"
                    title="Reject tool call"
                  >
                    {isRejectLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <X size={14} />
                    )}
                    Reject
                  </button>
                )}
                {onAccept && (
                  <button
                    onClick={handleAccept}
                    disabled={isAcceptLoading || isRejectLoading}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded transition-colors duration-200"
                    title="Accept tool call"
                  >
                    {isAcceptLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Accept
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ToolUseDisplay;