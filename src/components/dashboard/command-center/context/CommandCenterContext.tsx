"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { SessionMessage, useCommandCenter } from '../hooks/useCommandCenter';

interface CommandCenterContextType {
    isHistoryOpen: boolean;
    toggleHistorySidebar: () => void;
    messages: SessionMessage[];
    SendMessage: (content: string) => Promise<{
        error: string;
    } | undefined>;
    sendingMessage: boolean;
    streamedMessage: SessionMessage | null;
    toolCallAction: (action: "accept" | "reject") => Promise<void>;
    retryLastMessage: () => Promise<{
        error: string;
    } | undefined>;
}

const CommandCenterContext = createContext<CommandCenterContextType | undefined>(undefined);

export const CommandCenterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
    const hookValues = useCommandCenter();

    const toggleHistorySidebar = () => {
        setIsHistoryOpen(prev => !prev);
    };

    return (
        <CommandCenterContext.Provider value={{
            isHistoryOpen,
            toggleHistorySidebar,
            ...hookValues
        }}>
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