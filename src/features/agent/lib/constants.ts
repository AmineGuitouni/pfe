// Constants for the MiniAiChat component
export const CHAT_CONFIG = {
  PLACEHOLDER_TEXT: 'Type your message...',
  HEADER_TITLE: 'AI Assistant',
  HEADER_SUBTITLE: 'Always here to help'
} as const;

export const STYLING = {
  COLORS: {
    BACKGROUND: 'bg-modal_bg',
    BORDER: 'border-light_blue/20',
    TEXT_PRIMARY: 'text-light_blue',
    TEXT_SECONDARY: 'text-light_blue/80',
    BUTTON_PRIMARY: 'bg-light_blue-500',
    BUTTON_TEXT: 'text-dark_blue',
    USER_MESSAGE: 'bg-light_blue-500/80',
    AI_MESSAGE: 'bg-light_blue/10',
    INPUT_FOCUS: 'focus:border-light_blue-500',
    SCROLLBAR: 'scrollbar-custom'
  },
  
  POSITIONING: {
    CONTAINER: 'fixed bottom-6 right-6 z-50',
    SHADOW: 'shadow-2xl shadow-dark_blue/20',
    BACKDROP: 'backdrop-blur-sm'
  }
} as const;
