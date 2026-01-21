'use client';

import React from 'react';
import { Zap, ZapOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface AutoAcceptToggleProps {
  isAutoAcceptEnabled: boolean;
  onToggleAutoAccept: () => void;
}

export const AutoAcceptToggle: React.FC<AutoAcceptToggleProps> = ({
  isAutoAcceptEnabled,
  onToggleAutoAccept
}) => {
  return (
    <motion.button
      onClick={onToggleAutoAccept}
      className={`p-2 rounded-lg transition-all duration-200 ${
        isAutoAcceptEnabled
          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 hover:text-gray-300'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Auto Accept Tool Calls: ${isAutoAcceptEnabled ? 'ON' : 'OFF'}`}
    >
      {isAutoAcceptEnabled ? <Zap size={16} /> : <ZapOff size={16} />}
    </motion.button>
  );
};