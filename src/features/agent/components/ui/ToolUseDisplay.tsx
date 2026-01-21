'use client';

import React, { useState, useMemo } from 'react';
import { Settings, Loader2, Check, X, Zap } from 'lucide-react';
import { STYLING } from '../../lib/constants';

/**
 * Legacy ToolCall format (kept for backwards compatibility)
 */
export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

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

interface ToolUseDisplayProps {
  toolCall?: ToolCall | OpenAIToolCall | undefined; // Support both old and new formats
  onAccept?: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
  isLast?: boolean;
  isAutoAcceptEnabled?: boolean;
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
 * Normalize tool call to common display format
 */
function normalizeToolCall(toolCall: ToolCall | OpenAIToolCall): ToolCall | null {
  if (!toolCall) return null;
  
  if (isOpenAIToolCall(toolCall)) {
    let parsedArgs: Record<string, any> = {};
    try {
      parsedArgs = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error('Failed to parse tool call arguments:', e);
      parsedArgs = { _raw: toolCall.function.arguments };
    }
    return {
      name: toolCall.function.name,
      parameters: parsedArgs
    };
  }
  
  // Legacy format
  return {
    name: toolCall.name,
    parameters: toolCall.parameters || {}
  };
}

export const ToolUseDisplay: React.FC<ToolUseDisplayProps> = ({
  toolCall,
  onAccept,
  onReject,
  isLast = false,
  isAutoAcceptEnabled = false
}) => {
  const [isAcceptLoading, setIsAcceptLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);

  // Normalize tool call to common format
  const normalizedToolCall = useMemo(() => {
    if (!toolCall) return null;
    return normalizeToolCall(toolCall);
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

  // Handle loading state when toolCall is undefined
  if (toolCall === undefined) {
    return (
      <div className={`mt-2 mb-1 p-3 border ${STYLING.COLORS.BORDER} rounded-lg ${STYLING.COLORS.AI_MESSAGE} shadow-md animate-pulse`}>
        <div className={`flex items-center gap-2 mb-2 ${STYLING.COLORS.TEXT_SECONDARY}`}>
          <Loader2 size={18} className="animate-spin" />
          <h4 className="font-semibold text-sm">Loading Tool Call...</h4>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className={`h-4 ${STYLING.COLORS.AI_MESSAGE} rounded w-1/4`}></div>
          <div className="pl-2 space-y-1">
            <div className={`h-3 ${STYLING.COLORS.AI_MESSAGE} rounded w-3/4`}></div>
            <div className={`h-3 ${STYLING.COLORS.AI_MESSAGE} rounded w-1/2`}></div>
          </div>
        </div>
      </div>
    );
  }

  // Validate normalized toolCall structure
  if (
    !normalizedToolCall ||
    typeof normalizedToolCall.name !== 'string' ||
    !normalizedToolCall.name.trim() ||
    typeof normalizedToolCall.parameters !== 'object' ||
    normalizedToolCall.parameters === null
  ) {
    return (
      <div className={`mt-2 mb-1 p-3 border border-orange-400/50 rounded-lg bg-orange-400/20 text-orange-200`}>
        <div className="flex items-center gap-2 mb-1">
          <Settings size={18} />
          <p className="text-xs font-semibold">Tool Call Display Error</p>
        </div>
        <p className="text-xs mt-1">Could not display tool call due to invalid data structure.</p>
      </div>
    );
  }

  return (
    <div className={`mt-2 mb-1 p-3 border ${STYLING.COLORS.BORDER} rounded-lg ${STYLING.COLORS.AI_MESSAGE} shadow-md`}>
      <div className={`flex items-center gap-2 ${STYLING.COLORS.TEXT_PRIMARY} mb-2`}>
        <Settings size={18} />
        <h4 className="font-semibold text-sm">Tool Call: {normalizedToolCall.name}</h4>
      </div>
      
      {Object.keys(normalizedToolCall.parameters).length > 0 ? (
        <div className="space-y-1.5 text-xs">
          <p className={STYLING.COLORS.TEXT_SECONDARY}>Parameters:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            {Object.keys(normalizedToolCall.parameters).map((paramName) => {
              const paramValue = normalizedToolCall.parameters[paramName];
              
              return (
                <li key={paramName} className={STYLING.COLORS.TEXT_SECONDARY}>
                  <strong className={STYLING.COLORS.TEXT_PRIMARY}>{paramName}:</strong>
                  {(() => {
                    // Extract value from objects with type/value structure
                    let displayValue = paramValue;
                    if (typeof paramValue === 'object' && paramValue !== null && 'value' in paramValue && 'type' in paramValue) {
                      displayValue = paramValue.value;
                    }

                    // Handle different parameter value types
                    if (typeof displayValue === 'string' && displayValue.includes('\n')) {
                      return (
                        <pre className={`ml-2 mt-1 p-2 ${STYLING.COLORS.AI_MESSAGE} rounded text-xs whitespace-pre-wrap break-all border ${STYLING.COLORS.BORDER}`}>
                          {displayValue}
                        </pre>
                      );
                    } else if (typeof displayValue === 'object' && displayValue !== null) {
                      return (
                        <pre className={`ml-2 mt-1 p-2 ${STYLING.COLORS.AI_MESSAGE} rounded text-xs whitespace-pre-wrap break-all border ${STYLING.COLORS.BORDER}`}>
                          {JSON.stringify(displayValue, null, 2)}
                        </pre>
                      );
                    } else {
                      return (
                        <span className="ml-1 break-all">{String(displayValue)}</span>
                      );
                    }
                  })()}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className={`text-xs ${STYLING.COLORS.TEXT_SECONDARY} italic`}>No parameters provided.</p>
      )}
      
      {/* Action buttons or auto accept indicator at bottom right - only show if this is the last message */}
      {isLast && (
        <div className={`flex justify-end mt-3 pt-2 border-t ${STYLING.COLORS.BORDER}`}>
          {isAutoAcceptEnabled ? (
            <div className="flex items-center gap-2 px-2 py-1 text-xs bg-green-500/30 text-green-400 rounded">
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
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/80 hover:bg-red-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded transition-colors duration-200"
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
                    className={`flex items-center gap-1 px-2 py-1 text-xs ${STYLING.COLORS.BUTTON_PRIMARY} hover:bg-light_blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed ${STYLING.COLORS.BUTTON_TEXT} rounded transition-colors duration-200`}
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