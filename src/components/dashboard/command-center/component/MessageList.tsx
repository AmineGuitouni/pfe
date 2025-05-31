"use client";
import React, { useCallback, useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { useCommandCenterContext } from '../context/CommandCenterContext';
import LoadingIndicator from './LoadingIndicator';
import { SessionMessage } from '../hooks/useCommandCenter';


const MessageList = () => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const {messages, streamedMessage, sendingMessage} = useCommandCenterContext();
  
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  },[])

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Determine if a message should show the retry button
  const shouldShowRetryButton = useCallback((index: number, allMessages: SessionMessage[]) => {
    const message = allMessages[index];
    const isLastMessage = index === allMessages.length - 1;
    const isUserMessage = message.sender === 'user';
    
    // Only show retry for user messages that are the last message
    if (!isUserMessage || !isLastMessage) return false;
    
    // Don't show retry if we're currently sending a message
    if (sendingMessage) return false;
    
    // Check if there's any AI or tool response after this user message
    // Since it's the last message, there shouldn't be any responses after it
    return true;
  }, [sendingMessage]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          isLast={index === (messages.length-1) && !streamedMessage}
          showRetryButton={shouldShowRetryButton(index, messages)}
        />
      ))}
      {streamedMessage && <MessageItem message={streamedMessage} />}
      {sendingMessage && <LoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;