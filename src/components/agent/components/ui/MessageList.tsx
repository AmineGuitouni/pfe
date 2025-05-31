'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Message } from '../../lib/types';
import { STYLING } from '../../lib/constants';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  return (
    <motion.div 
      className={`flex-1 overflow-y-auto p-4 ${STYLING.COLORS.SCROLLBAR}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.05, duration: 0.15 }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.02
            }
          }
        }}
      >
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            index={index}
          />
        ))}
        <AnimatePresence>
          <TypingIndicator isVisible={isTyping} />
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
