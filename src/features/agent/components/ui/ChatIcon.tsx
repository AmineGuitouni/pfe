'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { iconVariants } from '../../lib/animations';
import { STYLING } from '../../lib/constants';

export const ChatIcon: React.FC = () => {
  return (
    <motion.div
      variants={iconVariants}
      whileHover="hover"
      animate="idle"
      className={`
        w-full h-full flex items-center justify-center
        ${STYLING.COLORS.BUTTON_PRIMARY} rounded-full
        cursor-pointer relative overflow-hidden
      `}
    >
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-light_blue-400"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 0.2, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main icon */}
      <motion.div
        animate={{
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Bot size={24} className={STYLING.COLORS.BUTTON_TEXT} />
      </motion.div>
    </motion.div>
  );
};
