'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from '@heroui/react';
import { Send, Mic, Square } from 'lucide-react';
import { ChatInputProps } from '../../lib/types';
import { inputVariants, sendButtonVariants } from '../../lib/animations';
import { STYLING, CHAT_CONFIG } from '../../lib/constants';

export const ChatInput: React.FC<ChatInputProps> = ({
  message,
  isLoading,
  isRecording,
  onMessageChange,
  onSendMessage,
  onStartRecording,
  onStopRecording
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <motion.div
      variants={inputVariants}
      initial="hidden"
      animate="visible"
      whileFocus="focus"
      className="flex items-center space-x-2 mt-4"
    >
      <Input
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={CHAT_CONFIG.PLACEHOLDER_TEXT}
        disabled={isLoading}
        className="flex-1"
        classNames={{
          input: `${STYLING.COLORS.TEXT_PRIMARY} bg-transparent`,
          inputWrapper: `
            ${STYLING.COLORS.BORDER} ${STYLING.COLORS.INPUT_FOCUS}
            bg-transparent border hover:border-light_blue/40
          `
        }}
      />
      
      {/* Voice Recording Button */}
      <motion.div
        variants={sendButtonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          isIconOnly
          className={`${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 hover:text-gray-300'
          } transition-all duration-200`}
          onPress={isRecording ? onStopRecording : onStartRecording}
          isDisabled={isLoading}
          size="sm"
        >
          {isRecording ? <Square size={16} /> : <Mic size={16} />}
        </Button>
      </motion.div>

      {/* Send Button */}
      <motion.div
        variants={sendButtonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          isIconOnly
          className={`${STYLING.COLORS.BUTTON_PRIMARY} ${STYLING.COLORS.BUTTON_TEXT}`}
          onPress={onSendMessage}
          isDisabled={!message.trim() || isLoading}
          size="sm"
        >
          <Send size={16} />
        </Button>
      </motion.div>
    </motion.div>
  );
};
