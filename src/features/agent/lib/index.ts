// Type exports
export type {
  SessionMessage,
  ChatState,
  ChatComponentProps,
  MessageBubbleProps,
  ChatInputProps,
  MessageListProps,
  TypingIndicatorProps
} from './types';

// Utility exports
export * from './utils';
export * from './messageUtils';
export * from './audioUtils';

// Animation variants exports
export {
  containerVariants,
  headerVariants,
  messageVariants,
  inputVariants,
  sendButtonVariants,
  dotVariants,
  iconVariants
} from './animations';

// Constants exports
export { CHAT_CONFIG, STYLING } from './constants';