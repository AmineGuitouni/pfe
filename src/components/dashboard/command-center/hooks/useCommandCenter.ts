import { CreateSessionRequest, CreateSessionResponse } from '@/app/api/v1/[user_id]/companies/[company_id]/command-center/sessions/new/route';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { streamChatResponse } from '../utils';

// Define the possible modes
export type CommandMode = 'chat' | 'cli';

export interface CommandCenterSession {
    id: string;
    name: string;
    mode: CommandMode;
    created_at: string;
}

export interface SessionMessage {
    id: string;
    session_id: string;
    sender: 'user' | 'ai' | 'tool';
    content: string;
    content_type: 'text' | 'audio'
    created_at: string;
}

export const useCommandCenter = () => {
  const [sessions, setSessions] = useState<CommandCenterSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const { data: userSession } = useSession();
  const router = useRouter();
  const {company:company_id, command_center_session, mode}: {
    company?: string | null;
    command_center_session?: string | null;
    mode?: CommandMode | null;
  } = useParams();

  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [streamedMessage, setStreamedMessage] = useState<SessionMessage | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const ActiveSession = useMemo(() => {
      return sessions.find(session => session.id === command_center_session);
  }, [sessions, command_center_session]);

  const [sendingMessage, setSendingMessage] = useState(false);

  const SendMessage = useCallback(async (content: string) =>{
    if(!userSession?.user?.id || !company_id){
      return {
        error: 'Missing required fields'
      }
    }

    setSendingMessage(true);

    try{
      let currentMode = mode
      if(!currentMode){
        const newMode = content.startsWith("@") ? "cli" : "chat";
        currentMode = newMode;
      }

      let currentSessionId = command_center_session
      if(!currentSessionId){
        // Create a new session if one doesn't exist
        const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company_id}/command-center/sessions/new`,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: content.slice(0, 20) + '...',
            mode: currentMode
          } as CreateSessionRequest)
        })

        if(!response.ok){
          return {
            error: 'Failed to create session'
          }
        }

        const {data, error}: CreateSessionResponse = await response.json();

        if(error || !data){
          return {
            error: 'Failed to create session'
          }
        }

        currentSessionId = data.session_id;
        router.push(`/dashboard/${company_id}/command-center/${currentMode}/${data.session_id}`);
      }

      const userMessage: SessionMessage = {
        id: crypto.randomUUID(),
        session_id: currentSessionId,
        sender: 'user',
        content,
        content_type: 'text',
        created_at: new Date().toISOString()
      }

      setMessages((prev) => [...prev, userMessage]);
      streamChatResponse({
        apiEndpoint: `/api/v1/${userSession.user.id}/companies/${company_id}/command-center/sessions/${currentSessionId}`,
        userMessage: content,
        callbacks:{
          onAiChunk: (chunk) =>{
            setStreamedMessage((prev) => prev ? {
              ...prev,
              content: prev.content + chunk
            }:{
              id: crypto.randomUUID(),
              session_id: currentSessionId,
              sender: 'ai',
              content: chunk,
              content_type: 'text',
              created_at: new Date().toISOString()
            })
          },
          onAiResponseEmpty: (data)=>{console.log('AI response empty:', data)},
          onAiResponseSaved: (data) =>{console.log('AI response saved:', data)},
          onError: (error) => {console.error('Error:', error)},
          onUserMessageSaved: (data)=>{console.log('User message saved:', data)},
          onStreamEnd: () => {console.log('Stream ended'); setSendingMessage(false); setStreamedMessage(null);},
        }
      })
    }
    catch (error) {
        console.error('Error sending message:', error);
        return {
            error: 'Failed to send message'
        }
    }
    finally {
      setSendingMessage(false);
    }
  }, [command_center_session, company_id, mode, router, userSession?.user.id]);

  // handle the agentic flow
  useEffect(()=>{
    
  },[])

  return {
    messages,
    SendMessage,
    sendingMessage,
    streamedMessage
  }
}