// Specialized hooks for clean architecture
export { useChatUIState } from './useChatUIState';
export { useAutoAccept } from './useAutoAccept';
export { useToolCallHandler } from './useToolCallHandler';
export { useMessageManager } from './useMessageManager';
export { useAudioRecording } from './useAudioRecording';
export { useLiveListening } from './useLiveListening';

// Session management
export { useMiniChatSession } from './useMiniChatSession';

// Context
export { ChatProvider, useChatContext } from '../contexts/ChatContext';