// Types for the MiniAiChat component - Enhanced for Command Center Integration

// Use the same SessionMessage format as command center
export interface SessionMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'ai' | 'tool';
  content: string;
  content_type: 'text' | 'audio';
  created_at: string;
  // New fields for OpenAI tool calling
  tool_calls?: string | any[]; // JSON string or parsed array of tool calls (for AI messages)
  tool_call_id?: string; // ID of the tool call this message is responding to (for tool messages)
  tool_name?: string; // Name of the tool (for tool messages)
}

export type ChatState = 'icon' | 'hovered' | 'expanded';

export interface ChatComponentProps {
  isExpanded: boolean;
  chatState: ChatState;
  onStateChange: (state: ChatState) => void;
}

export interface MessageBubbleProps {
  message: SessionMessage;
  index: number;
}

export interface ChatInputProps {
  message: string;
  isLoading: boolean;
  isRecording: boolean;
  isToolCallLoading?: boolean;
  isRetrying?: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export interface MessageListProps {
  messages: SessionMessage[];
  isTyping: boolean;
}

export interface TypingIndicatorProps {
  isVisible: boolean;
}
