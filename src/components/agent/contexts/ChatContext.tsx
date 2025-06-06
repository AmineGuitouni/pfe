'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { ChatState, SessionMessage } from '../lib/types';

// Context Types
interface ChatContextState {
  // Visual state
  chatState: ChatState;
  isSessionSelectorVisible: boolean;
  
  // Message state
  messages: SessionMessage[];
  currentMessage: string;
  isLoading: boolean;
  loadingMessages: boolean;
  
  // Audio state
  isVoiceResponseEnabled: boolean;
  isLiveListening: boolean;
  isRecording: boolean;
  
  // Auto-accept state
  isAutoAcceptEnabled: boolean;
  
  // Tool call state
  isToolCallLoading: boolean;
  isRetrying: boolean;
  
  // Session state
  sessionId: string | null;
  sessionError: string | null;
  isCreatingSession: boolean;
}

interface ChatContextActions {
  // Visual state actions
  setChatState: (state: ChatState) => void;
  setIsSessionSelectorVisible: (visible: boolean) => void;
  
  // Message state actions
  setMessages: (messages: SessionMessage[] | ((prev: SessionMessage[]) => SessionMessage[])) => void;
  setCurrentMessage: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
  
  // Audio state actions
  setIsVoiceResponseEnabled: (enabled: boolean) => void;
  setIsLiveListening: (listening: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  
  // Auto-accept state actions
  setIsAutoAcceptEnabled: (enabled: boolean) => void;
  
  // Tool call state actions
  setIsToolCallLoading: (loading: boolean) => void;
  setIsRetrying: (retrying: boolean) => void;
  
  // Session state actions
  setSessionId: (id: string | null) => void;
  setSessionError: (error: string | null) => void;
  setIsCreatingSession: (creating: boolean) => void;
}

type ChatContextType = ChatContextState & ChatContextActions;

// Action Types
type ChatAction =
  | { type: 'SET_CHAT_STATE'; payload: ChatState }
  | { type: 'SET_SESSION_SELECTOR_VISIBLE'; payload: boolean }
  | { type: 'SET_MESSAGES'; payload: SessionMessage[] | ((prev: SessionMessage[]) => SessionMessage[]) }
  | { type: 'SET_CURRENT_MESSAGE'; payload: string }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_MESSAGES'; payload: boolean }
  | { type: 'SET_VOICE_RESPONSE_ENABLED'; payload: boolean }
  | { type: 'SET_LIVE_LISTENING'; payload: boolean }
  | { type: 'SET_IS_RECORDING'; payload: boolean }
  | { type: 'SET_AUTO_ACCEPT_ENABLED'; payload: boolean }
  | { type: 'SET_TOOL_CALL_LOADING'; payload: boolean }
  | { type: 'SET_IS_RETRYING'; payload: boolean }
  | { type: 'SET_SESSION_ID'; payload: string | null }
  | { type: 'SET_SESSION_ERROR'; payload: string | null }
  | { type: 'SET_IS_CREATING_SESSION'; payload: boolean };

// Initial State
const initialState: ChatContextState = {
  // Visual state
  chatState: 'icon',
  isSessionSelectorVisible: false,
  
  // Message state
  messages: [],
  currentMessage: '',
  isLoading: false,
  loadingMessages: false,
  
  // Audio state
  isVoiceResponseEnabled: false,
  isLiveListening: false,
  isRecording: false,
  
  // Auto-accept state
  isAutoAcceptEnabled: false,
  
  // Tool call state
  isToolCallLoading: false,
  isRetrying: false,
  
  // Session state
  sessionId: null,
  sessionError: null,
  isCreatingSession: false,
};

// Reducer
const chatReducer = (state: ChatContextState, action: ChatAction): ChatContextState => {
  switch (action.type) {
    case 'SET_CHAT_STATE':
      return { ...state, chatState: action.payload };
    case 'SET_SESSION_SELECTOR_VISIBLE':
      return { ...state, isSessionSelectorVisible: action.payload };
    case 'SET_MESSAGES':
      return { 
        ...state, 
        messages: typeof action.payload === 'function' 
          ? action.payload(state.messages) 
          : action.payload 
      };
    case 'SET_CURRENT_MESSAGE':
      return { ...state, currentMessage: action.payload };
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LOADING_MESSAGES':
      return { ...state, loadingMessages: action.payload };
    case 'SET_VOICE_RESPONSE_ENABLED':
      return { ...state, isVoiceResponseEnabled: action.payload };
    case 'SET_LIVE_LISTENING':
      return { ...state, isLiveListening: action.payload };
    case 'SET_IS_RECORDING':
      return { ...state, isRecording: action.payload };
    case 'SET_AUTO_ACCEPT_ENABLED':
      return { ...state, isAutoAcceptEnabled: action.payload };
    case 'SET_TOOL_CALL_LOADING':
      return { ...state, isToolCallLoading: action.payload };
    case 'SET_IS_RETRYING':
      return { ...state, isRetrying: action.payload };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    case 'SET_SESSION_ERROR':
      return { ...state, sessionError: action.payload };
    case 'SET_IS_CREATING_SESSION':
      return { ...state, isCreatingSession: action.payload };
    default:
      return state;
  }
};

// Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider Component
interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Action creators
  const setChatState = useCallback((chatState: ChatState) => {
    dispatch({ type: 'SET_CHAT_STATE', payload: chatState });
  }, []);

  const setIsSessionSelectorVisible = useCallback((visible: boolean) => {
    dispatch({ type: 'SET_SESSION_SELECTOR_VISIBLE', payload: visible });
  }, []);

  const setMessages = useCallback((messages: SessionMessage[] | ((prev: SessionMessage[]) => SessionMessage[])) => {
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  }, []);

  const setCurrentMessage = useCallback((message: string) => {
    dispatch({ type: 'SET_CURRENT_MESSAGE', payload: message });
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_IS_LOADING', payload: loading });
  }, []);

  const setLoadingMessages = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING_MESSAGES', payload: loading });
  }, []);

  const setIsVoiceResponseEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_VOICE_RESPONSE_ENABLED', payload: enabled });
  }, []);

  const setIsLiveListening = useCallback((listening: boolean) => {
    dispatch({ type: 'SET_LIVE_LISTENING', payload: listening });
    
    // Log state change for debugging
    console.log('Live listening state changed:', {
      isListening: listening,
      timestamp: new Date().toISOString()
    });
  }, []);

  const setIsRecording = useCallback((recording: boolean) => {
    dispatch({ type: 'SET_IS_RECORDING', payload: recording });
  }, []);

  const setIsAutoAcceptEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUTO_ACCEPT_ENABLED', payload: enabled });
  }, []);

  const setIsToolCallLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_TOOL_CALL_LOADING', payload: loading });
  }, []);

  const setIsRetrying = useCallback((retrying: boolean) => {
    dispatch({ type: 'SET_IS_RETRYING', payload: retrying });
  }, []);

  const setSessionId = useCallback((id: string | null) => {
    dispatch({ type: 'SET_SESSION_ID', payload: id });
  }, []);

  const setSessionError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_SESSION_ERROR', payload: error });
  }, []);

  const setIsCreatingSession = useCallback((creating: boolean) => {
    dispatch({ type: 'SET_IS_CREATING_SESSION', payload: creating });
  }, []);

  const contextValue: ChatContextType = {
    // State
    ...state,
    
    // Actions
    setChatState,
    setIsSessionSelectorVisible,
    setMessages,
    setCurrentMessage,
    setIsLoading,
    setLoadingMessages,
    setIsVoiceResponseEnabled,
    setIsLiveListening,
    setIsRecording,
    setIsAutoAcceptEnabled,
    setIsToolCallLoading,
    setIsRetrying,
    setSessionId,
    setSessionError,
    setIsCreatingSession,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook to use the context
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};