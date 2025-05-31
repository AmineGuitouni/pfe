'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageBubbleProps } from '../../lib/types';
import { messageVariants } from '../../lib/animations';
import { STYLING } from '../../lib/constants';

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div
      variants={messageVariants}
      custom={index}
      whileHover="hover"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`
          max-w-[80%] px-4 py-2 rounded-2xl text-sm
          ${isUser 
            ? `${STYLING.COLORS.USER_MESSAGE} ${STYLING.COLORS.BUTTON_TEXT} rounded-br-lg` 
            : `${STYLING.COLORS.AI_MESSAGE} ${STYLING.COLORS.TEXT_PRIMARY} rounded-bl-lg`
          }
        `}
      >
        {message.text}
      </div>
    </motion.div>
  );
};
