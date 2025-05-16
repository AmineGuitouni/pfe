import React from 'react';
import { Settings, Loader2 } from 'lucide-react'; // Added Loader2 for loading state

// Define and export ToolCall related types if they are specific to this module
// or import them if they are shared.
export interface ToolCallParameter {
  type: string;
  value: string | number | boolean | object;
}

export interface ToolCall {
  name: string;
  parameters: Record<string, ToolCallParameter>;
}

interface ToolUseDisplayProps {
  toolCall: ToolCall | undefined; // Allow toolCall to be undefined for loading state
}

const ToolUseDisplay: React.FC<ToolUseDisplayProps> = ({ toolCall }) => {
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

  // 2. More robust check for toolCall structure (if not undefined)
  if (
    !toolCall || // This check handles null, which is different from undefined
    typeof toolCall.name !== 'string' ||
    !toolCall.name.trim() || // Ensure name is not just whitespace
    typeof toolCall.parameters !== 'object' ||
    toolCall.parameters === null // Check for null explicitly
  ) {
    console.warn("ToolUseDisplay received incomplete or malformed toolCall prop:", toolCall);
    return (
      <div className="mt-2 mb-1 p-3 border border-yellow-500 rounded-lg bg-yellow-600/30 text-yellow-200">
        <div className="flex items-center gap-2 mb-1">
          <Settings size={18} /> {/* Or a warning icon */}
          <p className="text-xs font-semibold">Tool Call Display Error</p>
        </div>
        <p className="text-xs mt-1">Could not display tool call due to invalid data structure.</p>
      </div>
    );
  }

  // 3. Render tool call details if data is valid
  return (
    <div className="mt-2 mb-1 p-3 border border-gray-600 rounded-lg bg-gray-700/50 shadow-md">
      <div className="flex items-center gap-2 mb-2 text-light_blue-300">
        <Settings size={18} />
        <h4 className="font-semibold text-sm">Tool Call: {toolCall.name}</h4>
      </div>
      {Object.keys(toolCall.parameters).length > 0 ? (
        <div className="space-y-1.5 text-xs">
          <p className="text-gray-400">Parameters:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            {Object.entries(toolCall.parameters).map(([paramName, paramDetails]) => (
              <li key={paramName} className="text-gray-300">
                <strong className="text-light_blue-400">{paramName}:</strong>
                {paramDetails && typeof paramDetails.value === 'string' && paramDetails.value.includes('\n') ? (
                  <pre className="ml-2 mt-1 p-2 bg-gray-800 rounded text-xs whitespace-pre-wrap break-all">
                    {paramDetails.value}
                  </pre>
                ) : (
                  <span className="ml-1 break-all">{paramDetails ? String(paramDetails.value) : 'N/A'}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">No parameters provided.</p>
      )}
    </div>
  );
};

export default ToolUseDisplay;