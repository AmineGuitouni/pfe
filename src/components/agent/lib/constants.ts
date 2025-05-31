// Constants for the MiniAiChat component
export const CHAT_CONFIG = {
  DEMO_MESSAGES: [
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'ai' as const,
      timestamp: new Date(Date.now() - 60000)
    },
    {
      id: '2',
      text: 'I need help with my dashboard',
      sender: 'user' as const,
      timestamp: new Date(Date.now() - 30000)
    },
    {
      id: '3',
      text: 'I can help you navigate and use your dashboard effectively. What specific area would you like assistance with?',
      sender: 'ai' as const,
      timestamp: new Date()
    }
  ],
  
  DEMO_RESPONSE: "I'm here to help! This is a demo response. In the full version, I'll provide intelligent assistance based on your queries.",
  
  RESPONSE_DELAY: 1500,
  
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
