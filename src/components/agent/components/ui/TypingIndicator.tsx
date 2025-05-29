'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TypingIndicatorProps } from '../../lib/types';
import { dotVariants } from '../../lib/animations';
import { STYLING } from '../../lib/constants';

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-3"
    >
      <div className={`${STYLING.COLORS.AI_MESSAGE} px-4 py-2 rounded-2xl rounded-bl-lg flex items-center space-x-1`}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            variants={dotVariants}
            custom={index}
            animate="visible"
            className={`w-2 h-2 ${STYLING.COLORS.TEXT_SECONDARY} bg-current rounded-full`}
          />
        ))}
      </div>
    </motion.div>
  );
};
