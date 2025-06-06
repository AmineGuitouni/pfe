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
  onStopRecording,
  isToolCallLoading = false,
  isRetrying = false
}) => {
  // Check if any operation is in progress
  const isAnyOperationLoading = isLoading || isToolCallLoading || isRetrying;

  const handleSend = () => {
    if (!message.trim() || isAnyOperationLoading) return;
    onSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && message.trim() && !isAnyOperationLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine placeholder text based on loading state
  const getPlaceholderText = () => {
    if (isLoading) {
      return "Please wait for the response before sending another message...";
    }
    if (isToolCallLoading) {
      return "Processing tool call... Please wait before sending another message...";
    }
    if (isRetrying) {
      return "Retrying message... Please wait before sending another message...";
    }
    return CHAT_CONFIG.PLACEHOLDER_TEXT;
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
          placeholder={getPlaceholderText()}
          disabled={false} // Allow typing even when loading
          className="flex-1"
          classNames={{
            input: `${STYLING.COLORS.TEXT_PRIMARY} bg-transparent ${isAnyOperationLoading ? 'opacity-75' : ''}`,
            inputWrapper: `
              ${STYLING.COLORS.BORDER} ${STYLING.COLORS.INPUT_FOCUS}
              bg-transparent border hover:border-light_blue/40
              ${isAnyOperationLoading ? 'border-orange-400/50 bg-orange-400/5' : ''}
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
                : isAnyOperationLoading
                ? 'bg-gray-600/10 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 hover:text-gray-300'
            } transition-all duration-200`}
            onPress={isRecording ? onStopRecording : onStartRecording}
            isDisabled={isAnyOperationLoading}
            size="sm"
            title={
              isAnyOperationLoading
                ? "Please wait for operation to complete before recording..."
                : isRecording
                ? "Stop recording"
                : "Start recording"
            }
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
            className={`${
              isAnyOperationLoading
                ? 'bg-orange-500/20 text-orange-400 cursor-not-allowed'
                : `${STYLING.COLORS.BUTTON_PRIMARY} ${STYLING.COLORS.BUTTON_TEXT}`
            } transition-all duration-200`}
            onPress={handleSend}
            isDisabled={!message.trim() || isAnyOperationLoading}
            size="sm"
            title={isAnyOperationLoading ? "Please wait for operation to complete..." : "Send message"}
          >
            {isAnyOperationLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full"
              />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </motion.div>
      </div>
      
      {/* Status indicator */}
      <AnimatePresence>
        {isAnyOperationLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center space-x-2 mt-2 text-xs text-orange-400"
          >
            <motion.div
              className="w-1.5 h-1.5 bg-orange-400 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
            <span>
              {isLoading && "AI is thinking..."}
              {isToolCallLoading && "Processing tool call..."}
              {isRetrying && "Retrying message..."}
              {" You can continue typing your next message"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
