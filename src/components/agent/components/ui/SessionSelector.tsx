'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { MessageSquare, Clock, Calendar, RefreshCw, ArrowLeft, Plus } from 'lucide-react';
import { STYLING } from '../../lib/constants';

interface ChatSession {
  id: string;
  name: string;
  mode: string;
  created_at: string;
}

interface ListSessionsResponse {
  data?: {
    sessions: ChatSession[];
  };
  error?: string;
}

interface SessionSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onSessionSelect: (sessionId: string) => void;
  onCreateNew: () => void;
  currentSessionId?: string | null;
}

const sessionVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: (index: number) => ({ 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.05,
      duration: 0.2,
      ease: "easeOut"
    }
  }),
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15
    }
  }
};

const containerVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 10
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.15,
      ease: "easeIn"
    }
  }
};

export const SessionSelector: React.FC<SessionSelectorProps> = ({
  isVisible,
  onClose,
  onSessionSelect,
  onCreateNew,
  currentSessionId
}) => {
  const { data: userSession } = useSession();
  const { company } = useParams() as { company: string };
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = useCallback(async (isRefresh = false) => {
    if (!userSession?.user?.id || !company) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(
        `/api/v1/${userSession.user.id}/companies/${company}/command-center/sessions/list`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data: ListSessionsResponse = await response.json();
      
      console.log('Sessions fetch response:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Filter for chat mode sessions only
      const allSessions = data.data?.sessions || [];
      console.log('All sessions:', allSessions);
      
      const chatSessions = allSessions.filter(
        (session: ChatSession) => session.mode === 'chat'
      );
      
      console.log('Chat sessions filtered:', chatSessions);
      setSessions(chatSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userSession?.user?.id, company]);

  useEffect(() => {
    if (isVisible) {
      fetchSessions();
    }
  }, [isVisible, fetchSessions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSessionClick = (sessionId: string) => {
    onSessionSelect(sessionId);
    onClose();
  };

  const handleCreateNew = () => {
    onCreateNew();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-0 z-10 flex flex-col bg-dark_blue"
      // style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="p-4 border-b border-light_blue/10 flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={onClose}
            className={`p-1 rounded-md hover:bg-light_blue/10 ${STYLING.COLORS.TEXT_SECONDARY} hover:text-light_blue transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={16} />
          </motion.button>
          <h3 className={`font-semibold ${STYLING.COLORS.TEXT_PRIMARY}`}>
            Chat Sessions
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => fetchSessions(true)}
            disabled={refreshing}
            className={`p-1 rounded-md hover:bg-light_blue/10 ${STYLING.COLORS.TEXT_SECONDARY} hover:text-light_blue transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Refresh sessions"
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw size={14} />
            </motion.div>
          </motion.button>
          
          <motion.button
            onClick={handleCreateNew}
            className={`p-1 rounded-md hover:bg-light_blue/10 ${STYLING.COLORS.TEXT_SECONDARY} hover:text-light_blue transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Start new chat"
          >
            <Plus size={14} />
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="flex-1 overflow-y-auto p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.2 }}
      >
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={`w-6 h-6 border-2 border-light_blue/30 border-t-light_blue rounded-full`}
            />
          </motion.div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-center py-8"
          >
            <MessageSquare size={32} className={`mx-auto ${STYLING.COLORS.TEXT_SECONDARY} mb-3`} />
            <p className={`${STYLING.COLORS.TEXT_PRIMARY} text-sm mb-2`}>No chat sessions found</p>
            <p className={`${STYLING.COLORS.TEXT_SECONDARY} text-xs`}>
              Start a conversation to see your sessions here
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-2"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.2
                }
              }
            }}
          >
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                variants={sessionVariants}
                custom={index}
                onClick={() => handleSessionClick(session.id)}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all group
                  ${session.id === currentSessionId 
                    ? 'bg-light_blue/20 border-light_blue/40' 
                    : 'bg-light_blue/5 border-light_blue/10 hover:bg-light_blue/10 hover:border-light_blue/30'
                  }
                `}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.15 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`text-sm font-medium truncate pr-2 group-hover:text-light_blue transition-colors ${
                    session.id === currentSessionId ? 'text-light_blue' : STYLING.COLORS.TEXT_PRIMARY
                  }`}>
                    {session.name}
                  </h4>
                  {session.id === currentSessionId && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-light_blue rounded-full"
                    />
                  )}
                </div>
                
                <div className={`flex items-center gap-3 ${STYLING.COLORS.TEXT_SECONDARY} text-xs`}>
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>{formatDate(session.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>{new Date(session.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};