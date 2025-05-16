"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ChatSession, CommandMode, Message, useCommandCenter } from '../hooks/useCommandCenter'; // Adjust path if necessary

// Define the shape of the context data
interface CommandCenterContextType {
    sessions: ChatSession[];
    activeSessionId: string | null;
    getActiveSession: () => ChatSession | undefined;
    setActiveSessionId: (sessionId: string | null) => void;
    createNewSession: (mode?: CommandMode) => void;
    // Updated: Only takes text, as 'user' sender is implicit for context consumers
    addMessageToActiveSession: (text: string) => Promise<void>;
    toggleModeInActiveSession: () => void;
    setLoadingInActiveSession: (isLoading: boolean) => void;
    isHistoryOpen: boolean;
    toggleHistorySidebar: () => void;
    streamedMessage: Message | null; // Renamed from streamdMessage
}

// Create the context
const CommandCenterContext = createContext<CommandCenterContextType | undefined>(undefined);

// Create the provider component
export const CommandCenterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);

    // Destructure all methods and state from the hook
    const hookValues = useCommandCenter();

    const toggleHistorySidebar = () => {
        setIsHistoryOpen(prev => !prev);
    };

    // Inside CommandCenterProvider
    const handleAddUserMessage = async (text: string) => {
        await hookValues.addMessageToActiveSession('user', text); // This remains correct for user inputs
    };


    const contextValue: CommandCenterContextType = {
        sessions: hookValues.sessions,
        activeSessionId: hookValues.activeSessionId,
        getActiveSession: hookValues.getActiveSession,
        setActiveSessionId: hookValues.setActiveSessionId,
        createNewSession: hookValues.createNewSession,
        addMessageToActiveSession: handleAddUserMessage, // Use the wrapper
        toggleModeInActiveSession: hookValues.toggleModeInActiveSession,
        setLoadingInActiveSession: hookValues.setLoadingInActiveSession,
        isHistoryOpen,
        toggleHistorySidebar,
        streamedMessage: hookValues.streamedMessage, // Correctly named
    };

    return (
        <CommandCenterContext.Provider value={contextValue}>
            {children}
        </CommandCenterContext.Provider>
    );
};

// Custom hook to use the context
export const useCommandCenterContext = (): CommandCenterContextType => {
    const context = useContext(CommandCenterContext);
    if (context === undefined) {
        throw new Error('useCommandCenterContext must be used within a CommandCenterProvider');
    }
    return context;
};