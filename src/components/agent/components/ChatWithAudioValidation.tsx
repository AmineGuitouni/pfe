/**
 * Example integration of audio validation in chat interface
 * This demonstrates how to use the audio validation features
 */

import React, { useState } from 'react';
import { AudioValidationStatus } from './AudioValidationStatus';
import { runAudioValidationTests } from '../lib/audioValidationTest';

interface ChatWithAudioValidationProps {
  // Your existing chat props
  className?: string;
}

export const ChatWithAudioValidation: React.FC<ChatWithAudioValidationProps> = ({
  className = ''
}) => {
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      await runAudioValidationTests();
      console.log('✅ Audio validation tests completed - check console for results');
    } catch (error) {
      console.error('❌ Audio validation tests failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className={`chat-with-validation ${className}`}>
      {/* Your existing chat interface */}
      <div className="chat-content">
        {/* ... your existing chat components ... */}
      </div>

      {/* Audio validation status (for development/debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Audio Validation Monitor
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowValidationDetails(!showValidationDetails)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                {showValidationDetails ? 'Hide Details' : 'Show Details'}
              </button>
              <button
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
              >
                {isRunningTests ? 'Running...' : 'Test Validation'}
              </button>
            </div>
          </div>
          
          <AudioValidationStatus 
            showDetails={showValidationDetails}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default ChatWithAudioValidation;
