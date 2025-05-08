"use client";

import React from 'react';
import { useCommandCenterContext } from '../context/CommandCenterContext';
import { PlusCircle, MessageSquare, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion

const sidebarVariants = {
    open: { width: 256, opacity: 1, transition: { type: "tween", duration: 0.3 } },
    closed: { width: 0, opacity: 0, transition: { type: "tween", duration: 0.3 } }
};

const HistorySidebar: React.FC = () => {
    // Get isHistoryOpen state from context
    const { sessions, activeSessionId, setActiveSessionId, createNewSession, isHistoryOpen } = useCommandCenterContext();

    return (
        // AnimatePresence handles the mounting/unmounting animation
        <AnimatePresence initial={false}>
            {isHistoryOpen && ( // Conditionally render based on state
                <motion.div
                    key="history-sidebar" // Need a key for AnimatePresence
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={sidebarVariants}
                    className="h-[calc(100vh-150px)] max-h-[800px] bg-modal_bg border-l border-light_blue-500/20 flex flex-col flex-shrink-0 overflow-hidden" // Added overflow-hidden, changed border-r to border-l
                >
                    {/* Header with New Chat Button */}
                    <div className="p-4 border-b border-light_blue-500/20 flex justify-between items-center flex-shrink-0">
                        <h3 className="text-md font-semibold text-light_blue whitespace-nowrap">History</h3>
                        <button
                            onClick={() => createNewSession()}
                            className="p-1 rounded-md text-light_blue hover:text-white hover:bg-light_blue-500/10 focus:outline-none focus:ring-1 focus:ring-light_blue-500/50 transition-colors"
                            title="New Chat Session"
                        >
                            <PlusCircle size={20} />
                        </button>
                    </div>

                    {/* Session List */}
                    {/* Added min-w-0, scrollbar styling (requires tailwind-scrollbar plugin) */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 min-w-0 scrollbar-thin scrollbar-thumb-light_blue-500/30 scrollbar-track-transparent">
                        {sessions.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => setActiveSessionId(session.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-left transition-colors whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-light_blue-500/50 ${ // Added focus ring, adjusted padding
                                    activeSessionId === session.id
                                        ? 'bg-light_blue-500/20 text-white' // Active state
                                        : 'text-gray-300 hover:bg-light_blue-500/10 hover:text-white' // Default/hover state
                                }`}
                            >
                                {session.mode === 'chat' ? <MessageSquare size={16} /> : <Terminal size={16} />}
                                <span className="truncate flex-1">{session.name}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HistorySidebar;