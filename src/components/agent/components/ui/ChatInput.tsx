'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      className="space-y-2 mt-4"
    >
      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center space-x-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <motion.div
              className="w-2 h-2 bg-red-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
            <span className="text-sm text-red-400 font-medium">Recording audio...</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center space-x-2">
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
          animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
          transition={{ 
            repeat: isRecording ? Infinity : 0, 
            duration: 1.5, 
            ease: "easeInOut" 
          }}
        >
          <Button
            isIconOnly
            className={`${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50' 
                : 'bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 hover:text-gray-300'
            } transition-all duration-200`}
            onPress={isRecording ? onStopRecording : onStartRecording}
            isDisabled={isLoading}
            size="sm"
            title={isRecording ? "Stop recording" : "Start recording"}
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
      </div>
    </motion.div>
  );
};
