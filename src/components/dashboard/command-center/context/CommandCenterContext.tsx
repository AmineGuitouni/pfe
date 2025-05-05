"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Message, CommandMode } from '../hooks/useCommandCenter'; // Reuse existing types

// Define the structure of a single chat session
export interface ChatSession {
    id: string;
    name: string; // e.g., "Chat 1", "CLI Session - List Projects"
    messages: Message[];
    mode: CommandMode;
    isLoading: boolean;
}

// Define the shape of the context data
interface CommandCenterContextType {
    sessions: ChatSession[];
    activeSessionId: string | null;
    getActiveSession: () => ChatSession | undefined;
    setActiveSessionId: (sessionId: string | null) => void;
    createNewSession: (mode?: CommandMode) => void;
    addMessageToActiveSession: (sender: 'user' | 'ai', text: string) => void;
    toggleModeInActiveSession: () => void;
    setLoadingInActiveSession: (isLoading: boolean) => void;
    // Add state and toggle for history sidebar visibility
    isHistoryOpen: boolean;
    toggleHistorySidebar: () => void;
}

// Create the context
const CommandCenterContext = createContext<CommandCenterContextType | undefined>(undefined);

// Initial dummy session
const createInitialSession = (id: string, mode: CommandMode = 'chat'): ChatSession => ({
    id,
    name: `Session ${id.substring(0, 4)} (${mode})`,
    messages: [
        { id: 'init-1', sender: 'ai', text: `Welcome to Command Center (${mode} mode)!` }
    ],
    mode: mode,
    isLoading: false,
});

// Create the provider component
export const CommandCenterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sessions, setSessions] = useState<ChatSession[]>([createInitialSession('1')]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(sessions[0]?.id || null);
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true); // State for sidebar visibility

    const toggleHistorySidebar = () => {
        setIsHistoryOpen(prev => !prev);
    };

    const getActiveSession = useCallback(() => {
        return sessions.find(session => session.id === activeSessionId);
    }, [sessions, activeSessionId]);

    const updateSession = (sessionId: string, updates: Partial<ChatSession>) => {
        setSessions(prevSessions =>
            prevSessions.map(session =>
                session.id === sessionId ? { ...session, ...updates } : session
            )
        );
    };

    const createNewSession = (mode: CommandMode = 'chat') => {
        const newId = Date.now().toString();
        const newSession = createInitialSession(newId, mode);
        setSessions(prev => [...prev, newSession]);
        setActiveSessionId(newId);
    };

    const addMessageToActiveSession = (sender: 'user' | 'ai', text: string) => {
        if (!activeSessionId) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender,
            text,
        };

        const activeSession = getActiveSession();
        if (!activeSession) return;

        const updatedMessages = [...activeSession.messages, newMessage];
        updateSession(activeSessionId, { messages: updatedMessages });

        // Simulate response (TODO: Replace with actual API call based on mode)
        if (sender === 'user') {
            setLoadingInActiveSession(true);
            setTimeout(() => {
                 const responseText = activeSession.mode === 'chat'
                    ? `Simulated AI response to: "${text}"`
                    : `Simulated CLI output for: "${text}"`;
                const aiResponse: Message = {
                    id: Date.now().toString() + '-ai',
                    sender: 'ai',
                    text: responseText,
                };
                 setSessions(prevSessions =>
                    prevSessions.map(session =>
                        session.id === activeSessionId
                            ? { ...session, messages: [...updatedMessages, aiResponse], isLoading: false }
                            : session
                    )
                );
            }, 1500);
        }
    };

     const toggleModeInActiveSession = () => {
        if (!activeSessionId) return;
        const activeSession = getActiveSession();
        if (!activeSession) return;
        const newMode = activeSession.mode === 'chat' ? 'cli' : 'chat';
        updateSession(activeSessionId, { mode: newMode });
    };

    const setLoadingInActiveSession = (isLoading: boolean) => {
         if (!activeSessionId) return;
         updateSession(activeSessionId, { isLoading });
    }

    const contextValue: CommandCenterContextType = {
        sessions,
        activeSessionId,
        getActiveSession,
        setActiveSessionId,
        createNewSession,
        addMessageToActiveSession,
        toggleModeInActiveSession,
        setLoadingInActiveSession,
        isHistoryOpen,          // Export state
        toggleHistorySidebar,   // Export toggle function
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