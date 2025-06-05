// Keep original hook for now (maintaining backward compatibility)
export { useChatState } from './useChatState';

// New refactored hook (available but not used yet)
export { useChatState as useChatStateRefactored } from './useChatStateRefactored';

// Specialized hooks
export { useChatUIState } from './useChatUIState';
export { useAutoAccept } from './useAutoAccept';
export { useToolCallHandler } from './useToolCallHandler';
export { useMessageManager } from './useMessageManager';
export { useAudioRecording } from './useAudioRecording';

// Session management
export { useMiniChatSession } from './useMiniChatSession';

// Context
export { ChatProvider, useChatContext } from '../contexts/ChatContext';