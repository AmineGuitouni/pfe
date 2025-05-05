import React, { useEffect, useRef } from 'react';
import { Message } from '../hooks/useCommandCenter'; // Updated type import
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll to bottom whenever messages update

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark_blue/80">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {/* Empty div to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;