import React from 'react';
import { Message } from '../hooks/useCommandCenter'; // Updated type import
import { User, Bot } from 'lucide-react'; // Using lucide icons for user/ai representation

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Icon */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-light_blue-500/20 flex items-center justify-center">
          <Bot size={20} className="text-light_blue" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg shadow ${
          isUser
            ? 'bg-light_blue-500 text-dark_blue rounded-br-none' // User message style
            : 'bg-modal_bg text-white rounded-bl-none' // AI message style
        }`}
      >
        {/* Render text, potentially formatting code blocks differently in CLI mode later */}
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>

      {/* Icon */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
          <User size={20} className="text-gray-700 dark:text-gray-200" />
        </div>
      )}
    </div>
  );
};

export default MessageItem;