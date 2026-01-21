// Utility functions for the MiniAiChat component
import { SessionMessage } from './types';

/**
 * Generates a unique ID for messages
 */
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Formats timestamp for display in messages
 */
export const formatMessageTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formats ISO string timestamp for display
 */
export const formatMessageTimeFromISO = (isoString: string): string => {
  return formatMessageTime(new Date(isoString));
};

/**
 * Creates a new session message object
 */
export const createSessionMessage = (
  content: string,
  sender: 'user' | 'ai' | 'tool' = 'user',
  sessionId: string,
  contentType: 'text' | 'audio' = 'text'
): SessionMessage => ({
  id: generateMessageId(),
  session_id: sessionId,
  content: content.trim(),
  sender,
  content_type: contentType,
  created_at: new Date().toISOString()
});

/**
 * Validates if a message is valid for sending
 */
export const isValidMessage = (text: string): boolean => {
  return text.trim().length > 0 && text.trim().length <= 1000;
};

/**
 * Scrolls chat container to bottom (for auto-scroll on new messages)
 */
export const scrollToBottom = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollTop = element.scrollHeight;
  }
};

/**
 * Debounce function for typing indicators
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Truncate long messages for preview
 */
export const truncateMessage = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Get greeting message based on time of day
 */
export const getGreetingMessage = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "Good morning! How can I help you today?";
  } else if (hour < 17) {
    return "Good afternoon! What can I assist you with?";
  } else {
    return "Good evening! How may I help you?";
  }
};

/**
 * Check if user is active (for status indicators)
 */
export const getUserStatus = (): 'online' | 'away' | 'offline' => {
  // This could be enhanced with actual user activity tracking
  return 'online';
};

/**
 * Format file size for file attachments (future feature)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
