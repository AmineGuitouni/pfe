// Types for the MiniAiChat component
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export type ChatState = 'icon' | 'hovered' | 'expanded';

export interface ChatComponentProps {
  isExpanded: boolean;
  chatState: ChatState;
  onStateChange: (state: ChatState) => void;
}

export interface MessageBubbleProps {
  message: Message;
  index: number;
}

export interface ChatInputProps {
  message: string;
  isLoading: boolean;
  isRecording: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export interface TypingIndicatorProps {
  isVisible: boolean;
}
