"use client";
import React, { useCallback, useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { useCommandCenterContext } from '../context/CommandCenterContext';
import LoadingIndicator from './LoadingIndicator';


const MessageList = () => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const {messages, streamedMessage} = useCommandCenterContext();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  },[])

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {streamedMessage && <MessageItem message={streamedMessage} />}
      <LoadingIndicator />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;