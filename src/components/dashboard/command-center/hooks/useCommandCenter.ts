import { useState } from 'react';

// Define the possible modes
export type CommandMode = 'chat' | 'cli';

export interface Message {
  id: string;
  sender: 'user' | 'ai'; // Keep 'ai' for now, might represent agent/system response
  text: string;
}

// Dummy data for initial state
const initialMessages: Message[] = [
  { id: '1', sender: 'ai', text: 'Welcome to the Command Center! How can I assist you today?' }, // Updated initial message
  { id: '2', sender: 'user', text: 'List running projects.' }, // Example command
  { id: '3', sender: 'ai', text: 'Simulating command execution... Found 3 running projects: Alpha, Beta, Gamma.' }, // Example simulated response
];

// Renamed hook
export const useCommandCenter = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false); // To simulate AI/command response loading
  const [mode, setMode] = useState<CommandMode>('chat'); // Add mode state, default to 'chat'

  // Function to toggle mode
  const toggleMode = () => {
    setMode(prev => (prev === 'chat' ? 'cli' : 'chat'));
    // Optional: Clear messages or add a system message when mode changes?
  };

  const addMessage = (sender: 'user' | 'ai', text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(), // Simple unique ID for now
      sender,
      text,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Simulate AI/command response after user message
    if (sender === 'user') {
      setIsLoading(true);
      setTimeout(() => {
        const aiResponse: Message = {
          id: Date.now().toString() + '-ai',
          sender: 'ai',
          text: `Simulated response/output for: "${text}"`, // Updated simulated response
        };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
        setIsLoading(false);
      }, 1500); // Simulate network/execution delay
    }
  };

  return {
    messages,
    isLoading,
    addMessage,
    mode,       // Export mode
    toggleMode, // Export toggle function
  };
};