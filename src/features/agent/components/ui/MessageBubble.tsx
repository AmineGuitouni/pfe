'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageBubbleProps } from '../../lib/types';
import { messageVariants } from '../../lib/animations';
import { STYLING } from '../../lib/constants';
import { AudioMessage } from './AudioMessage';

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  const isUser = message.sender === 'user';
  const isTool = message.sender === 'tool';
  const isAI = message.sender === 'ai' || isTool; // Treat tool messages as AI messages in UI
  const isAudio = message.content_type === 'audio';

  // Format tool messages with a special indicator
  const displayText = isTool ? `🔧 ${message.content}` : message.content;

  return (
    <motion.div
      variants={messageVariants}
      custom={index}
      whileHover="hover"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {isAudio ? (
        <AudioMessage
          audioUrl={message.content}
          isOwnMessage={isUser}
          onError={(error) => console.error('Audio message error:', error)}
        />
      ) : (
        <div
          className={`
            max-w-[80%] px-4 py-2 rounded-2xl text-sm
            ${isUser
              ? `${STYLING.COLORS.USER_MESSAGE} ${STYLING.COLORS.BUTTON_TEXT} rounded-br-lg`
              : `${STYLING.COLORS.AI_MESSAGE} ${STYLING.COLORS.TEXT_PRIMARY} rounded-bl-lg ${
                  isTool ? 'border-l-4 border-orange-400' : ''
                }`
            }
          `}
        >
          {displayText}
        </div>
      )}
    </motion.div>
  );
};
