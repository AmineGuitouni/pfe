'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Radio, Activity, Loader2 } from 'lucide-react';

interface LiveListeningStatusProps {
  vadState: 'calibrating' | 'listening' | 'recording' | 'processing' | 'idle';
  isVisible: boolean;
}

export const LiveListeningStatus: React.FC<LiveListeningStatusProps> = ({
  vadState,
  isVisible
}) => {
  if (!isVisible || vadState === 'idle') {
    return null;
  }

  const getStatusConfig = () => {
    switch (vadState) {
      case 'calibrating':
        return {
          icon: <Loader2 size={12} className="animate-spin" />,
          text: 'Calibrating...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30'
        };
      case 'listening':
        return {
          icon: <Radio size={12} />,
          text: 'Listening',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30'
        };
      case 'recording':
        return {
          icon: <Mic size={12} />,
          text: 'Recording',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30'
        };
      case 'processing':
        return {
          icon: <Activity size={12} />,
          text: 'Processing',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30'
        };
      default:
        return {
          icon: <Radio size={12} />,
          text: 'Active',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30'
        };
    }
  };

  const { icon, text, color, bgColor, borderColor } = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center space-x-2 px-3 py-1.5 rounded-full
        border ${borderColor} ${bgColor} ${color}
        text-xs font-medium
      `}
    >
      <motion.div
        animate={vadState === 'recording' ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.div>
      <span>{text}</span>
    </motion.div>
  );
};