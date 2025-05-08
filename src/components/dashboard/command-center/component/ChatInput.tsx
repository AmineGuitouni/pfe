"use client";

import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  // Placeholder could be dynamic based on mode later
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message or command..." // Updated placeholder
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim() && !disabled) {
      onSendMessage(inputText);
      setInputText(''); // Clear input after sending
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline on Enter
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-light_blue-500/20 bg-dark_blue">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder} // Use prop for placeholder
          disabled={disabled}
          className="flex-1 px-4 py-2 rounded-full bg-modal_bg border border-light_blue-500/30 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-light_blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !inputText.trim()}
          className="p-2 rounded-full bg-light_blue-500 text-dark_blue hover:bg-light_blue focus:outline-none focus:ring-2 focus:ring-light_blue focus:ring-offset-2 focus:ring-offset-dark_blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message or command" // Updated aria-label
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;