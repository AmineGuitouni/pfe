"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { SessionMessage, useCommandCenter } from '../hooks/useCommandCenter';
import { useParams } from 'next/navigation';

interface CommandCenterContextType {
    isHistoryOpen: boolean;
    toggleHistorySidebar: () => void;
    messages: SessionMessage[];
    SendMessage: (content: string, contentType?: 'text' | 'audio') => Promise<{
        error: string;
    } | undefined>;
    sendingMessage: boolean;
    streamedMessage: SessionMessage | null;
    toolCallAction: (action: "accept" | "reject") => Promise<void>;
    retryLastMessage: () => Promise<{
        error: string;
    } | undefined>;
    loadingMessages: boolean;
    isAutoAcceptEnabled: boolean;
    toggleAutoAccept: () => void;
}

const CommandCenterContext = createContext<CommandCenterContextType | undefined>(undefined);

export const CommandCenterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
    const [isAutoAcceptEnabled, setIsAutoAcceptEnabled] = useState<boolean>(false);
    const hookValues = useCommandCenter();
    const { company } = useParams() as { company: string };

    // Destructure specific values for useEffect dependencies
    const { messages, sendingMessage, toolCallAction } = hookValues;

    // Load auto accept setting from localStorage on mount
    useEffect(() => {
        if (company) {
            const stored = localStorage.getItem(`commandCenter_autoAccept_${company}`);
            if (stored) {
                setIsAutoAcceptEnabled(JSON.parse(stored));
            }
        }
    }, [company]);

    const toggleHistorySidebar = () => {
        setIsHistoryOpen(prev => !prev);
    };

    const toggleAutoAccept = () => {
        setIsAutoAcceptEnabled(prev => {
            const newValue = !prev;
            if (company) {
                localStorage.setItem(`commandCenter_autoAccept_${company}`, JSON.stringify(newValue));
            }
            return newValue;
        });
    };

    // Auto accept logic - trigger when new AI message with tool_use appears
    useEffect(() => {
        if (!isAutoAcceptEnabled || sendingMessage) return;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.sender === 'ai' && lastMessage.content.includes('```tool_use')) {
            // Small delay to ensure UI is ready
            const timeoutId = setTimeout(() => {
                toolCallAction('accept');
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [messages, isAutoAcceptEnabled, toolCallAction, sendingMessage]);

    return (
        <CommandCenterContext.Provider value={{
            isHistoryOpen,
            toggleHistorySidebar,
            isAutoAcceptEnabled,
            toggleAutoAccept,
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