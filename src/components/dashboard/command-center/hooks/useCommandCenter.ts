import { CommandCenterRequestBody } from '@/app/api/v1/[user_id]/companies/[company_id]/command-center/route';
import { tools } from '@/lib/ai/agent/tools/toolsDefinitions';
import { extractToolUse } from '@/lib/ai/agent/utils';
import { useCompanyId } from '@/providers/companyIdProvider';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

// Define the possible modes
export type CommandMode = 'chat' | 'cli';

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'tool';
  text: string;
}

export interface ChatSession {
    id: string;
    name: string;
    messages: Message[];
    mode: CommandMode;
    isLoading: boolean;
}

const createInitialSession = (id: string, mode: CommandMode = 'chat'): ChatSession => ({
    id,
    name: `Session ${id.substring(0, 4)} (${mode})`,
    messages: [
        { id: 'init-1', sender: 'ai', text: `Welcome to Command Center (${mode} mode)!` }
    ],
    mode: mode,
    isLoading: false,
});

export const useCommandCenter = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([createInitialSession('1')]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessions[0]?.id || null);
  const { data: userSession } = useSession();
  const company_id = useCompanyId();
  const [streamedMessage, setStreamedMessage] = useState<Message | null>(null);

  const getActiveSession = useCallback(() => {
      return sessions.find(session => session.id === activeSessionId);
  }, [sessions, activeSessionId]);

  const updateSession = useCallback((sessionId: string, updates: Partial<ChatSession>) => {
      setSessions(prevSessions =>
          prevSessions.map(session =>
              session.id === sessionId ? { ...session, ...updates } : session
          )
      );
  }, []);

  const createNewSession = (mode: CommandMode = 'chat') => {
      const newId = Date.now().toString();
      const newSession = createInitialSession(newId, mode);
      setSessions(prev => [...prev, newSession]);
      setActiveSessionId(newId);
  };

  const addMessageToActiveSession = useCallback(async (
    sender: 'user' | 'tool',
    text: string
  ) => {
    if (!activeSessionId || !userSession?.user.id) return;

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender,
      text,
    };

    // Get history *before* adding the newMessage to the session state for the current call.
    const sessionForHistory = sessions.find(s => s.id === activeSessionId);
    const historyForAPI = sessionForHistory?.messages.slice(1) || []; // Exclude welcome message

    // Add the new user/tool message to the session and set loading state.
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === activeSessionId
          ? { ...session, messages: [...(session.messages || []), newMessage], isLoading: true }
          : session
      )
    );

    let accumulatedResponse = "";

    getChatStream({
      history: historyForAPI,
      query: newMessage.text,
      user_id: userSession.user.id,
      company_id: company_id,
      onMessageChunk: (chunk: string) => {
        accumulatedResponse += chunk;
        setStreamedMessage(prev => prev ? {
          ...prev,
          text: prev.text + chunk
        } : {
          id: newMessage.id + '-stream',
          sender: 'ai',
          text: chunk
        });
      },
      onError: (error: string) => {
        console.error("getChatStream error:", error);
        setStreamedMessage(null);
        const errorAiResponse: Message = {
          id: Date.now().toString() + '-ai-error',
          sender: 'ai',
          text: `An error occurred: ${error}. Please try again.`,
        };
        setSessions(prevSessions =>
          prevSessions.map(session => {
            if (session.id === activeSessionId) {
                const currentMessages = Array.isArray(session.messages) ? session.messages : [];
                return { ...session, messages: [...currentMessages, errorAiResponse], isLoading: false };
            }
            return session;
          })
        );
      },
      onFinish: async () => {
        setStreamedMessage(null);

        const aiFinalResponse: Message = {
          id: Date.now().toString() + '-ai-final',
          sender: 'ai',
          text: accumulatedResponse,
        };

        // Add AI's final response.
        setSessions(prevSessions =>
          prevSessions.map(session => {
            if (session.id === activeSessionId) {
              const currentMessages = Array.isArray(session.messages) ? session.messages : [];
              return {
                ...session,
                messages: [...currentMessages, aiFinalResponse],
                // isLoading will be managed based on tool processing below
              };
            }
            return session;
          })
        );

        const toolUseRegex = /```tool_use\s*([\s\S]*?)\s*```/;
        const toolUseMatch = aiFinalResponse.text.match(toolUseRegex);
        const toolUseString = toolUseMatch?.[1];
        const parsedToolUse = toolUseString ? extractToolUse(toolUseString) : null;

        if (parsedToolUse) {
          const tool = tools[parsedToolUse.tool_name];
          if (tool) {
            // Add tool execution indicator message
            const toolIndicatorMessage: Message = {
              id: `${Date.now()}-tool-indicator-${parsedToolUse.tool_name}`,
              sender: 'ai', // Using 'ai' as sender. Could be 'system' if differentiated.
              text: `Executing tool: ${parsedToolUse.tool_name}...`
            };

            // Update sessions to include the indicator message.
            // This happens after aiFinalResponse is added and before tool execution.
            setSessions(prevSessions =>
              prevSessions.map(session => {
                if (session.id === activeSessionId) {
                  const currentMessages = Array.isArray(session.messages) ? session.messages : [];
                  return {
                    ...session,
                    messages: [...currentMessages, toolIndicatorMessage],
                    // isLoading is already true from the initial message that triggered this flow,
                    // or will be set true again by the recursive call to addMessageToActiveSession
                    // when the tool result is processed.
                  };
                }
                return session;
              })
            );

            try {
              const toolOutput = await tool(parsedToolUse.parameters);
              const toolResultText = `\`\`\`tool_result\n${JSON.stringify({
                tool_name: parsedToolUse.tool_name,
                output: toolOutput
              })}\n\`\`\``;
              // Feed the tool result back to the AI. This will set isLoading: true again.
              addMessageToActiveSession('tool', toolResultText);
            } catch (e: any) {
              console.error("Tool execution error:", e);
              const toolErrorText = `\`\`\`tool_result\n${JSON.stringify({
                tool_name: parsedToolUse.tool_name,
                error: e instanceof Error ? e.message : String(e)
              })}\n\`\`\``;
              addMessageToActiveSession('tool', toolErrorText);
            }
          } else {
            console.warn(`Tool ${parsedToolUse.tool_name} not found.`);
            const toolNotFoundText = `\`\`\`tool_result\n${JSON.stringify({
              tool_name: parsedToolUse.tool_name,
              error: `Tool "${parsedToolUse.tool_name}" not found.`
            })}\n\`\`\``;
            // Inform AI about the missing tool. This will set isLoading: true.
            addMessageToActiveSession('tool', toolNotFoundText);
          }
        } else {
          // No tool use, this interaction turn is complete. Set isLoading to false.
          if (activeSessionId) { // Ensure activeSessionId is valid
            updateSession(activeSessionId, { isLoading: false });
          }
        }
      },
    });
  }, [activeSessionId, userSession, company_id, sessions, updateSession]);


  const toggleModeInActiveSession = () => {
    if (!activeSessionId) return;
    const activeSession = getActiveSession();
    if (!activeSession) return;
    const newMode = activeSession.mode === 'chat' ? 'cli' : 'chat';
    updateSession(activeSessionId, {
        mode: newMode,
        name: `Session ${activeSession.id.substring(0, 4)} (${newMode})`,
        messages: [
            { id: 'init-mode-toggle', sender: 'ai', text: `Switched to ${newMode} mode.` }
        ],
        isLoading: false,
    });
  };

  const setLoadingInActiveSession = useCallback((isLoading: boolean) => {
    if (!activeSessionId) return;
    updateSession(activeSessionId, { isLoading });
  }, [activeSessionId, updateSession]);

  return {
      sessions,
      activeSessionId,
      getActiveSession,
      setActiveSessionId,
      createNewSession,
      addMessageToActiveSession,
      toggleModeInActiveSession,
      setLoadingInActiveSession,
      streamedMessage,
  };
};

// getChatStream function remains the same
function getChatStream({
  onMessageChunk,
  user_id,
  company_id,
  query,
  onError,
  onFinish,
  history
}:{
  onMessageChunk?: (chunk: string) => void,
  onError?: (error: string) => void,
  onFinish?: () => void,
  user_id: string,
  company_id: string,
  query: string,
  history?: Message[]
}) {
  fetch(`/api/v1/${user_id}/companies/${company_id}/command-center`,{
      method:"POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        query,
        history: history || []
      } as CommandCenterRequestBody),
  })
  .then((res)=>{
      if(res.ok){
          if (res.body) {
            return res.body;
          }
          throw new Error("Response OK but body is null");
      }
      return res.text().then(text => {
        let errorMsg = `Request failed with status ${res.status}`;
        if (text) {
            try {
                const errJson = JSON.parse(text);
                errorMsg = errJson.error || errJson.message || text;
            } catch (e) {
              errorMsg = text;
              console.log(e)
            }
        }
        throw new Error(errorMsg);
      });
  })
  .then(async (readableStream: ReadableStream<Uint8Array>)=>{
      const reader = readableStream.getReader();
      let chunkResult = await reader.read();
      while(!chunkResult.done){
          const textChunk = new TextDecoder().decode(chunkResult.value);
          onMessageChunk?.(textChunk);
          chunkResult = await reader.read();
      }
  })
  .catch((err: Error )=>{
      onError?.(err.message || "An unknown error occurred during streaming.");
  })
  .finally(()=>{
      onFinish?.();
  });
}