import React, { useCallback, useEffect, useRef } from 'react';
import { Message } from '../hooks/useCommandCenter'; // Updated type import
import MessageItem from './MessageItem';
import { useCommandCenterContext } from '../context/CommandCenterContext';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const {streamedMessage} = useCommandCenterContext();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  },[])

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark_blue/80">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {streamedMessage && <MessageItem message={streamedMessage} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;