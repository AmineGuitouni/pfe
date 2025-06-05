'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { STYLING } from '../../lib/constants';

interface ToolResultDisplayProps {
  toolName: string;
  output?: any;
  error?: string | { message: string; [key: string]: any };
}

export const ToolResultDisplay: React.FC<ToolResultDisplayProps> = ({ 
  toolName, 
  output, 
  error 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed
  const hasError = error !== undefined && error !== null;
  const hasOutput = output !== undefined && output !== null;

  let displayErrorMessage: string | null = null;
  if (hasError) {
    if (typeof error === 'string') {
      displayErrorMessage = error;
    } else if (typeof error === 'object' && typeof error.message === 'string') {
      displayErrorMessage = error.message;
    } else {
      displayErrorMessage = 'An error occurred with the tool. Raw error: ' + JSON.stringify(error);
    }
  }

  const renderOutput = (data: any): React.ReactNode => {
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return <span className="break-all">{String(data)}</span>;
    }
    if (typeof data === 'object' && data !== null) {
      try {
        const jsonString = JSON.stringify(data, null, 2);
        if (jsonString === '{}' || jsonString === '[]') {
          return <span className={`${STYLING.COLORS.TEXT_SECONDARY} italic`}>Empty output (object/array).</span>;
        }
        return (
          <pre className={`mt-1 p-2 ${STYLING.COLORS.AI_MESSAGE} rounded text-xs whitespace-pre-wrap break-all border ${STYLING.COLORS.BORDER}`}>
            {jsonString}
          </pre>
        );
      } catch (e) {
        console.error('Error rendering complex output:', e);
        return <span className="text-red-400">Error displaying complex output.</span>;
      }
    }
    return <span className={`${STYLING.COLORS.TEXT_SECONDARY} italic`}>No renderable output provided.</span>;
  };

  const successColor = 'text-green-400';
  const errorColor = 'text-red-400';
  const successBg = 'bg-green-500/20';
  const errorBg = 'bg-red-500/20';
  const successBorder = 'border-green-500/50';
  const errorBorder = 'border-red-500/50';

  return (
    <div className={`mt-1 p-3 border rounded-lg shadow-inner ${
      hasError ? `${errorBorder} ${errorBg}` : `${successBorder} ${successBg}`
    }`}>
      <div className={`flex items-center gap-2 mb-2 ${
        hasError ? errorColor : successColor
      }`}>
        {hasError ? <XCircle size={18} /> : <CheckCircle size={18} />}
        <h4 className="font-semibold text-sm flex-1">
          Tool: {toolName}
        </h4>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center justify-center w-6 h-6 rounded hover:bg-opacity-20 transition-colors ${
            hasError ? 'hover:bg-red-500' : 'hover:bg-green-500'
          }`}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {hasError && displayErrorMessage && (
            <div className="text-xs">
              <p className="font-medium text-red-300">Error:</p>
              <p className="whitespace-pre-wrap break-all text-red-200">{displayErrorMessage}</p>
            </div>
          )}

          {!hasError && hasOutput && (
            <div className="space-y-1 text-xs">
              <p className="font-medium text-green-300">Output:</p>
              <div className={STYLING.COLORS.TEXT_SECONDARY}>{renderOutput(output)}</div>
            </div>
          )}
          
          {!hasError && !hasOutput && (
             <p className="text-xs text-green-300 italic">Tool executed successfully. (No explicit output)</p>
          )}
        </>
      )}
    </div>
  );
};