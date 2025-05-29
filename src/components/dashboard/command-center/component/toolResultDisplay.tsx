import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface ToolResultDisplayProps {
  toolName: string;
  output?: any;
  error?: string | { message: string; [key: string]: any }; // Allow error to be string or object with message
}

const ToolResultDisplay: React.FC<ToolResultDisplayProps> = ({ toolName, output, error }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const hasError = error !== undefined && error !== null;
  const hasOutput = output !== undefined && output !== null;

  let displayErrorMessage: string | null = null;
  if (hasError) {
    if (typeof error === 'string') {
      displayErrorMessage = error;
    } else if (typeof error === 'object' && typeof error.message === 'string') {
      displayErrorMessage = error.message;
    } else {
      // Fallback for unexpected error structure
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
        // Check if output is just an empty object or array string
        if (jsonString === '{}' || jsonString === '[]') {
            return <span className="text-gray-400 italic">Empty output (object/array).</span>;
        }
        return (
          <pre className="mt-1 p-2 bg-gray-800/70 rounded text-xs whitespace-pre-wrap break-all">
            {jsonString}
          </pre>
        );
      } catch (e) {
        console.error('Error rendering complex output:', e);
        return <span className="text-red-400">Error displaying complex output.</span>;
      }
    }
    // Handles null or undefined output explicitly if not caught by hasOutput
    return <span className="text-gray-400 italic">No renderable output provided.</span>;
  };

  return (
    <div className={`mt-1 p-3 border rounded-lg shadow-inner ${
      hasError ? 'border-red-500/50 bg-red-900/30' : 'border-green-500/50 bg-green-900/30'
    }`}>
      <div className={`flex items-center gap-2 mb-2 ${
        hasError ? 'text-red-300' : 'text-green-300'
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
              <p className="font-medium text-red-200">Error:</p>
              <p className="whitespace-pre-wrap break-all text-red-300">{displayErrorMessage}</p>
            </div>
          )}

          {!hasError && hasOutput && (
            <div className="space-y-1 text-xs">
              <p className="font-medium text-green-200">Output:</p>
              <div className="text-gray-200">{renderOutput(output)}</div>
            </div>
          )}
          
          {!hasError && !hasOutput && (
             <p className="text-xs text-green-400 italic">Tool executed successfully. (No explicit output)</p>
          )}
        </>
      )}
    </div>
  );
};

export default ToolResultDisplay;