'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX, Mic, MicOff, MessageSquare } from 'lucide-react';
import { STYLING, CHAT_CONFIG } from '../../lib/constants';
import { AutoAcceptToggle } from './AutoAcceptToggle';
import { LiveListeningStatus } from './LiveListeningStatus';

interface ChatHeaderProps {
  onClose: () => void;
  isVoiceResponseEnabled: boolean;
  isLiveListening: boolean;
  onToggleVoiceResponse: () => void;
  onToggleLiveListening: () => void;
  onNavigateToCommandCenter?: () => void;
  onShowSessionSelector?: () => void;
  isAutoAcceptEnabled?: boolean;
  onToggleAutoAccept?: () => void;
  liveListeningState?: {
    vadState: 'calibrating' | 'listening' | 'recording' | 'processing' | 'idle';
    isInitialized: boolean;
  };
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  isVoiceResponseEnabled,
  isLiveListening,
  onToggleVoiceResponse,
  onToggleLiveListening,
  onShowSessionSelector,
  isAutoAcceptEnabled = false,
  onToggleAutoAccept,
  liveListeningState
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.2, 
        ease: "easeOut"
      }}
      className="p-4 border-b border-light_blue/10"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${STYLING.COLORS.TEXT_PRIMARY}`}>
            {CHAT_CONFIG.HEADER_TITLE}
          </h3>
          <p className={`text-xs ${STYLING.COLORS.TEXT_SECONDARY} mt-1`}>
            {CHAT_CONFIG.HEADER_SUBTITLE}
          </p>
          {/* Live Listening Status */}
          {liveListeningState && (
            <div className="mt-2">
              <LiveListeningStatus
                vadState={liveListeningState.vadState}
                isVisible={isLiveListening && liveListeningState.isInitialized}
              />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* Session Selector Button */}
          {onShowSessionSelector && (
            <motion.button
              onClick={onShowSessionSelector}
              className={`p-2 rounded-lg transition-all duration-200 bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 hover:text-gray-300`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Browse chat sessions"
            >
              <MessageSquare size={16} />
            </motion.button>
          )}

          {/* Auto Accept Toggle */}
          {onToggleAutoAccept && (
            <AutoAcceptToggle
              isAutoAcceptEnabled={isAutoAcceptEnabled}
              onToggleAutoAccept={onToggleAutoAccept}
            />
          )}

          {/* Voice Response Button */}
          <motion.button
            onClick={onToggleVoiceResponse}
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
            onClick={onToggleLiveListening}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isLiveListening
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 hover:text-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isLiveListening ? "Stop live listening" : "Start live listening"}
          >
            {isLiveListening ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Mic size={16} />
              </motion.div>
            ) : (
              <MicOff size={16} />
            )}
          </motion.button>

          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className={`p-1 rounded-md hover:bg-red-500/10 ${STYLING.COLORS.TEXT_SECONDARY} hover:text-red-500 transition-colors`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
