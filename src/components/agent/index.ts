// Main export - everything from components
export * from './components';

// Direct exports for convenience
export { MiniAiChat } from './components';
export { useChatState, useMiniChatSession } from './hooks';
export type { SessionMessage, ChatState } from './lib';