'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface LiveListeningButtonProps {
  isLiveListening: boolean;
  onToggleLiveListening: (e?: React.MouseEvent) => void;
  size?: number;
  className?: string;
  title?: string;
}

export const LiveListeningButton: React.FC<LiveListeningButtonProps> = ({
  isLiveListening,
  onToggleLiveListening,
  size = 16,
  className = '',
  title
}) => {
  const defaultTitle = isLiveListening ? "Stop live listening" : "Start live listening";
  const buttonTitle = title || defaultTitle;

  const baseClasses = `p-2 rounded-lg transition-all duration-200 ${
    isLiveListening
      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
      : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 hover:text-gray-300'
  }`;

  return (
    <motion.button
      onClick={(e) => onToggleLiveListening(e)}
      className={`${baseClasses} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={buttonTitle}
    >
      {isLiveListening ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mic size={size} />
        </motion.div>
      ) : (
        <MicOff size={size} />
      )}
    </motion.button>
  );
};
