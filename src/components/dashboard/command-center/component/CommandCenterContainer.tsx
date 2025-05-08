"use client";

import React from 'react';
// Remove old hook import
import { useCommandCenterContext } from '../context/CommandCenterContext'; // Import context hook
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import LoadingIndicator from './LoadingIndicator';
import { Terminal, MessageCircle, PanelRightOpen } from 'lucide-react'; // Import icons for mode toggle and history toggle

// Renamed component
const CommandCenterContainer: React.FC = () => {
  // Use context hook
  const {
    getActiveSession,
    addMessageToActiveSession,
    toggleModeInActiveSession,
    toggleHistorySidebar, // Get history toggle function
  } = useCommandCenterContext();

  const activeSession = getActiveSession(); // Get the currently active session data

  // Handle cases where there might be no active session (e.g., initial load or error)
  if (!activeSession) {
    // Optionally return a placeholder or loading state
    return <div className="flex-1 flex items-center justify-center text-gray-500">Select or create a session</div>;
  }

  // Destructure data from the active session
  const { messages, isLoading, mode } = activeSession;

  const handleSendMessage = (text: string) => {
    if (text.trim()) {
      addMessageToActiveSession('user', text.trim()); // Use context function
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] max-h-[800px] w-full max-w-4xl mx-auto bg-dark_blue border border-light_blue-500/20 rounded-lg shadow-xl overflow-hidden">
      {/* Header with Mode Toggle Button */}
      <div className="p-4 border-b border-light_blue-500/20 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-light_blue">Command Center</h2>
        <div className="flex items-center gap-2"> {/* Wrap buttons */}
          {/* Mode Toggle Button */}
          <button
            onClick={toggleModeInActiveSession} // Use context function
            className="flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-light_blue-500/10 text-light_blue hover:bg-light_blue-500/20 transition-colors"
          title={`Switch to ${mode === 'chat' ? 'CLI' : 'Chat'} mode`}
        >
          {mode === 'chat' ? (
            <>
              <MessageCircle size={16} /> Chat Mode
            </>
          ) : (
            <>
              <Terminal size={16} /> CLI Mode
            </>
          )}
          </button>
          {/* History Toggle Button */}
          <button
            onClick={toggleHistorySidebar}
            className="p-2 rounded-md text-light_blue hover:bg-light_blue-500/20 transition-colors"
            title="Toggle History Sidebar"
          >
            <PanelRightOpen size={18} />
          </button>
        </div>
      </div>

      {/* Message List */}
      <MessageList messages={messages} />

      {/* Loading Indicator */}
      {isLoading && <LoadingIndicator />}

      {/* Input Area with dynamic placeholder */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={mode === 'chat' ? 'Type your message...' : 'Enter command...'}
      />
    </div>
  );
};

export default CommandCenterContainer; // Updated export