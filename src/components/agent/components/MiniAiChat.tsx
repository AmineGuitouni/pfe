'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

// Component imports
import { ChatIcon, ChatHeader, MessageList, ChatInput, SessionSelector } from './ui';

// Hook and utility imports
import { useChatState } from '../hooks';
import { containerVariants, STYLING } from '../lib';

export const MiniAiChat: React.FC = () => {
  const { data: session } = useSession();
  const {
    chatState,
    messages,
    currentMessage,
    isLoading,
    isTyping,
    isVoiceResponseEnabled,
    isLiveListening,
    isRecording,
    isSessionSelectorVisible,
    handleStateChange,
    handleSendMessage,
    setCurrentMessage,
    toggleVoiceResponse,
    toggleLiveListening,
    startRecording,
    stopRecording,
    navigateToCommandCenter,
    showSessionSelector,
    hideSessionSelector,
    handleSessionSelect,
    handleCreateNewSession,
    sessionId,
    isAutoAcceptEnabled,
    toggleAutoAccept,
    toolCallAction,
    isToolCallLoading,
    retryLastMessage,
    isRetrying
  } = useChatState();
  
  const mouseLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Cleanup timeout on unmount or state change
  useEffect(() => {
    return () => {
      if (mouseLeaveTimeoutRef.current) {
        clearTimeout(mouseLeaveTimeoutRef.current);
      }
    };
  }, [chatState]);

  // Handle transition state
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 200);
    return () => clearTimeout(timer);
  }, [chatState]);

  // Only show for authenticated users
  if (!session) {
    return null;
  }

  const handleContainerClick = () => {
    // Clear any pending timeouts to prevent state conflicts
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
      mouseLeaveTimeoutRef.current = null;
    }
    
    if (chatState === 'icon' || chatState === 'hovered') {
      handleStateChange('expanded');
    }
  };

  const handleMouseEnter = () => {
    // Don't handle mouse events during transitions
    if (isTransitioning) return;
    
    // Clear any pending mouse leave timeout
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
      mouseLeaveTimeoutRef.current = null;
    }
    
    // Only change to hovered if currently in icon state
    if (chatState === 'icon') {
      handleStateChange('hovered');
    }
  };

  const handleMouseLeave = () => {
    // Don't handle mouse events during transitions
    if (isTransitioning) return;
    
    // Only handle mouse leave if in hovered state
    if (chatState === 'hovered') {
      // Add a delay to prevent immediate revert when trying to click
      mouseLeaveTimeoutRef.current = setTimeout(() => {
        handleStateChange('icon');
      }, 150);
    }
  };

  const handleClose = () => {
    handleStateChange('icon');
  };

  return (
    <motion.div
      className={`
        ${STYLING.POSITIONING.CONTAINER}
        ${STYLING.COLORS.BACKGROUND}
        ${STYLING.COLORS.BORDER}
        ${STYLING.POSITIONING.SHADOW}
        ${STYLING.POSITIONING.BACKDROP}
        border overflow-hidden cursor-pointer
      `}
      variants={containerVariants}
      initial="icon"
      animate={chatState}
      onClick={handleContainerClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      layout
      layoutId="mini-ai-chat"
    >
      <AnimatePresence mode="wait" initial={false}>
        {chatState === 'icon' && (
          <motion.div
            key="icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.15,
              ease: "easeInOut"
            }}
            className="w-full h-full"
          >
            <ChatIcon />
          </motion.div>
        )}

        {chatState === 'hovered' && (
          <motion.div
            key="hovered"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.15,
              ease: "easeInOut"
            }}
            className="p-4 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                className={`w-10 h-10 ${STYLING.COLORS.BUTTON_PRIMARY} rounded-full flex items-center justify-center shadow-lg`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.15 }}
              >
                <span className={`text-sm font-semibold ${STYLING.COLORS.BUTTON_TEXT}`}>AI</span>
              </motion.div>
              <div className="flex-1">
                <motion.h4
                  className={`text-sm font-semibold ${STYLING.COLORS.TEXT_PRIMARY} group-hover:text-light_blue-400 transition-colors`}
                  initial={{ x: -5, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.15 }}
                >
                  AI Assistant
                </motion.h4>
                <motion.p
                  className={`text-xs ${STYLING.COLORS.TEXT_SECONDARY} group-hover:text-light_blue-300 transition-colors`}
                  initial={{ x: -5, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.12, duration: 0.15 }}
                >
                  Click to start chatting
                </motion.p>
              </div>
            </div>
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.15 }}
            >
              {/* Voice Response Button */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVoiceResponse();
                }}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isVoiceResponseEnabled 
                    ? 'bg-light_blue/20 text-light_blue hover:bg-light_blue/30' 
                    : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 hover:text-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isVoiceResponseEnabled ? "Disable voice response" : "Enable voice response"}
              >
                {isVoiceResponseEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </motion.button>

              {/* Live Listening Button */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLiveListening();
                }}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isLiveListening 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 hover:text-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isLiveListening ? "Stop live listening" : "Start live listening"}
              >
                {isLiveListening ? <MicOff size={16} /> : <Mic size={16} />}
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {chatState === 'expanded' && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.15,
              ease: "easeInOut"
            }}
            className="h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <ChatHeader
              onClose={handleClose}
              isVoiceResponseEnabled={isVoiceResponseEnabled}
              isLiveListening={isLiveListening}
              onToggleVoiceResponse={toggleVoiceResponse}
              onToggleLiveListening={toggleLiveListening}
              onNavigateToCommandCenter={navigateToCommandCenter}
              onShowSessionSelector={showSessionSelector}
              isAutoAcceptEnabled={isAutoAcceptEnabled}
              onToggleAutoAccept={toggleAutoAccept}
            />
            
            {/* Session Selector - overlays the entire chat when visible */}
            <AnimatePresence>
              {isSessionSelectorVisible && (
                <SessionSelector
                  isVisible={isSessionSelectorVisible}
                  onClose={hideSessionSelector}
                  onSessionSelect={handleSessionSelect}
                  onCreateNew={handleCreateNewSession}
                  currentSessionId={sessionId}
                />
              )}
            </AnimatePresence>
            
            {!isSessionSelectorVisible && (
              <>
                <MessageList
                  messages={messages}
                  isTyping={isTyping || isToolCallLoading}
                  toolCallAction={toolCallAction}
                  isAutoAcceptEnabled={isAutoAcceptEnabled}
                  retryLastMessage={retryLastMessage}
                  isRetrying={isRetrying}
                />
                <motion.div
                  className="p-4 border-t border-light_blue/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.15, ease: "easeOut" }}
                >
                  <ChatInput
                    message={currentMessage}
                    isLoading={isLoading}
                    isRecording={isRecording}
                    onMessageChange={setCurrentMessage}
                    onSendMessage={handleSendMessage}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                  />
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
