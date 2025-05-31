import { CreateSessionRequest, CreateSessionResponse } from '@/app/api/v1/[user_id]/companies/[company_id]/command-center/sessions/new/route';
import { MessagesRouteResponse } from '@/app/api/v1/[user_id]/companies/[company_id]/command-center/sessions/[session_id]/messages/route';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

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
    content_type: 'text' | 'audio';
    created_at: string;
}

export const useCommandCenter = () => {
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

  // const ActiveSession = useMemo(() => {
  //     return sessions.find(session => session.id === command_center_session);
  // }, [sessions, command_center_session]);

  const [sendingMessage, setSendingMessage] = useState(false);

  const SendMessage = useCallback(async (content: string) =>{
    if(!userSession?.user?.id || !company_id){
      return {
        error: 'Missing required fields'
      }
    }

    // Generate placeholder ID outside try block for error handling access
    const placeholderId = crypto.randomUUID();
    
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
        setMessages([]);
      }

      const userMessage: SessionMessage = {
        id: placeholderId,
        session_id: currentSessionId,
        sender: 'user',
        content,
        content_type: 'text',
        created_at: new Date().toISOString()
      }

      // Add user message to local state immediately for optimistic UI
      setMessages(prev => [...prev, userMessage]);
      setSendingMessage(true);
      
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company_id}/command-center/sessions/${currentSessionId}`, {
        method: 'POST',
        body: JSON.stringify({
          user_prompt: content,
        })
      })

      if(!response.ok) {
        // Remove the optimistic user message on failure
        setMessages(prev => prev.filter(msg => msg.id !== placeholderId));
        setSendingMessage(false);
        return {
          error: 'Failed to send message'
        }
      }

      const { response: aiResponse, response_id, user_message_id } = await response.json();
      console.log('AI Response:', aiResponse);

      // Update the user message with the actual ID from server
      setMessages(prev => prev.map(msg => 
        msg.id === placeholderId ? { ...msg, id: user_message_id } : msg
      ));
      
      // Add AI response to existing messages (user message already added optimistically)
      setMessages(prev => [...prev, {
        id: response_id,
        session_id: currentSessionId,
        sender: 'ai',
        content: aiResponse,
        content_type: 'text',
        created_at: new Date().toISOString()
      }]);
      
      setSendingMessage(false);
    }
    catch (error) {
        console.error('Error sending message:', error);
        // Remove the optimistic user message on error
        setMessages(prev => prev.filter(msg => msg.id !== placeholderId));
        setSendingMessage(false);
        return {
            error: 'Failed to send message'
        }
    }
  }, [command_center_session, company_id, mode, router, userSession?.user.id]);

  const toolCallAction = useCallback(async(action: 'accept' | 'reject') => {
    if(!userSession?.user?.id || !company_id || !command_center_session) return;

    setSendingMessage(true);

    try {
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company_id}/command-center/sessions/${command_center_session}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accept_tool_call: action === 'accept',
          reject_tool_call: action === 'reject'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process tool call');
      }

      const { response: aiResponse, error, toolCallMessage, response_id }: { response: string; error?: string, toolCallMessage:{id:string, content:string}, response_id:string } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Add AI response to existing messages
      setMessages(prev => [...prev, {
        id: toolCallMessage.id,
        session_id: command_center_session,
        sender: 'tool',
        content: toolCallMessage.content,
        content_type: 'text',
        created_at: new Date().toISOString()
      },{
        id: response_id,
        session_id: command_center_session,
        sender: 'ai',
        content: aiResponse,
        content_type: 'text',
        created_at: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error processing tool call:', error);
    } finally {
      setSendingMessage(false);
    }
  },[command_center_session, company_id, userSession?.user.id])

  const retryLastMessage = useCallback(async () => {
    if(!userSession?.user?.id || !company_id || !command_center_session) {
      return {
        error: 'Missing required fields'
      }
    }

    setSendingMessage(true);

    try {
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company_id}/command-center/sessions/${command_center_session}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Empty body - the API will process the existing last user message
        })
      });

      if (!response.ok) {
        throw new Error('Failed to retry message');
      }

      const { response: aiResponse, response_id, error }: { response: string; response_id: string; error?: string } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Add new AI response to existing messages
      setMessages(prev => [...prev, {
        id: response_id,
        session_id: command_center_session,
        sender: 'ai',
        content: aiResponse,
        content_type: 'text',
        created_at: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error retrying message:', error);
      return {
        error: 'Failed to retry message'
      }
    } finally {
      setSendingMessage(false);
    }
  }, [command_center_session, company_id, userSession?.user.id])

  const fetchMessages = useCallback(async () => {
    // Skip fetching if currently sending a message or if no session exists
    if (!command_center_session || !userSession?.user?.id || !company_id || sendingMessage) return;

    setLoadingMessages(true);

    try {
      const response = await fetch(`/api/v1/${userSession.user.id}/companies/${company_id}/command-center/sessions/${command_center_session}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const { data, error }: MessagesRouteResponse = await response.json();

      if (error || !data) {
        throw new Error('Failed to fetch messages');
      }

      // Transform the response to match our SessionMessage interface
      const transformedMessages: SessionMessage[] = data.map(message => ({
        id: message.id,
        session_id: message.session_id,
        sender: message.sender,
        content: message.content,
        content_type: message.type,
        created_at: message.created_at
      }));
      console.log('Fetched messages:', transformedMessages);
      setMessages(prev => {
        const filteredPrev = prev.filter(msg => msg.session_id !== command_center_session);
        const uniqueMessages = transformedMessages.filter(msg => !filteredPrev.some(prevMsg => prevMsg.id === msg.id));
        return [...filteredPrev, ...uniqueMessages];
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [command_center_session, company_id, userSession?.user.id, sendingMessage]);


  // Fetch messages when the component mounts or command_center_session changes
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages]);

  // handle the agentic flow
  useEffect(()=>{
    
  },[])

  return {
    messages,
    loadingMessages,
    SendMessage,
    sendingMessage,
    streamedMessage,
    fetchMessages,
    toolCallAction,
    retryLastMessage
  }
}