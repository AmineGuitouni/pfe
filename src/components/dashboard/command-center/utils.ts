interface UserMessageData {
    id: string;
    content: string;
    sender: 'user';
    created_at: string;
}

interface AiMessageData {
    messageId: string;
    content: string;
}

interface AiMessageEmptyData {
    type: 'final';
    message: string;
}

interface StreamCallbacks {
    onUserMessageSaved: (data: UserMessageData) => void;
    onAiChunk: (chunk: string) => void;
    onAiResponseSaved: (data: AiMessageData) => void;
    onAiResponseEmpty: (data: AiMessageEmptyData) => void;
    onError: (error: { message: string } | Event) => void;
    onStreamEnd?: () => void; // Optional: Called when stream closes for any reason
}

interface StreamChatResponseParams {
    apiEndpoint: string; // e.g., '/api/chat-stream'
    userMessage: string;
    // You might need to pass other identifiers like sessionId or existingMessages
    // if your API needs them as query parameters for the GET request.
    // For this example, we'll assume they are handled by the server via session/cookies
    // or are not needed directly in the EventSource URL.
    // If they are, add them to `additionalParams`.
    additionalParams?: Record<string, string>;
    callbacks: StreamCallbacks;
}

export function streamChatResponse({
    apiEndpoint,
    userMessage,
    additionalParams = {},
    callbacks,
}: StreamChatResponseParams): EventSource {
    const {
        onUserMessageSaved,
        onAiChunk,
        onAiResponseSaved,
        onAiResponseEmpty,
        onError,
        onStreamEnd,
    } = callbacks;

    const queryParams = new URLSearchParams({
        userMessage,
        ...additionalParams,
    });
    const url = `${apiEndpoint}?${queryParams.toString()}`;

    const eventSource = new EventSource(url);
    let streamEndedHandled = false;

    const handleStreamEnd = () => {
        if (!streamEndedHandled) {
            streamEndedHandled = true;
            if (onStreamEnd) {
                onStreamEnd();
            }
        }
    };

    eventSource.onopen = () => {
        console.log("SSE Connection opened.");
    };

    // Listener for user message confirmation
    eventSource.addEventListener('userMessageProcessed', (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'userMessageProcessed' && data.message) {
                onUserMessageSaved(data.message as UserMessageData);
            } else {
                console.warn('Received malformed userMessageProcessed event:', data);
            }
        } catch (e) {
            console.error('Error parsing userMessageProcessed event:', e, event.data);
            onError({ message: 'Error parsing userMessageProcessed event data' });
        }
    });

    // Listener for AI response chunks (default 'message' event)
    eventSource.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'chunk' && typeof data.content === 'string') {
                onAiChunk(data.content);
            }
            // Note: If your server sends other types of messages without a specific 'event:' name,
            // they would also be caught here. Ensure your 'chunk' type is distinct.
        } catch (e) {
            console.error('Error parsing AI chunk event:', e, event.data);
            onError({ message: 'Error parsing AI chunk event data' });
        }
    });

    // Listener for final AI message saved
    eventSource.addEventListener('AImessageSaved', (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'final' && data.messageId) {
                onAiResponseSaved(data as AiMessageData);
            } else {
                console.warn('Received malformed AImessageSaved event:', data);
            }
        } catch (e) {
            console.error('Error parsing AImessageSaved event:', e, event.data);
            onError({ message: 'Error parsing AImessageSaved event data' });
        } finally {
            eventSource.close(); // Server indicated end of AI response
            handleStreamEnd();
        }
    });

    // Listener for empty AI response
    eventSource.addEventListener('AImessageEmpty', (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'final' && data.message) {
                onAiResponseEmpty(data as AiMessageEmptyData);
            } else {
                console.warn('Received malformed AImessageEmpty event:', data);
            }
        } catch (e) {
            console.error('Error parsing AImessageEmpty event:', e, event.data);
            onError({ message: 'Error parsing AImessageEmpty event data' });
        } finally {
            eventSource.close(); // Server indicated end of AI response (empty)
            handleStreamEnd();
        }
    });

    // Listener for custom error events from the server AND generic EventSource errors
    eventSource.addEventListener('error', (event: Event | MessageEvent) => {
        // Check if it's a MessageEvent with data (our custom server-sent error)
        if ('data' in event && (event as MessageEvent).data) {
            try {
                const errorData = JSON.parse((event as MessageEvent).data);
                onError({ message: errorData.message || 'Unknown server error from stream' });
            } catch (e) {
                console.error('Error parsing server error event:', e, (event as MessageEvent).data);
                onError({ message: `Malformed error event from server: ${(event as MessageEvent).data}` });
            }
        } else {
            // Generic EventSource error (e.g., connection failed, server closed unexpectedly)
            if (eventSource.readyState === EventSource.CLOSED) {
                onError({ message: 'SSE connection closed unexpectedly by server or network issue.' });
            } else if (eventSource.readyState === EventSource.CONNECTING) {
                onError({ message: 'SSE connection failed, attempting to reconnect...' });
                // EventSource will attempt to reconnect automatically unless server sends HTTP 204
                // or client calls eventSource.close().
                // You might not want to call handleStreamEnd() here if auto-reconnect is desired.
                // However, for a chat, usually an error means the current exchange failed.
            } else {
                onError(event); // Pass the raw event
            }
        }
        // For most errors, we assume the stream is no longer viable for this request.
        eventSource.close();
        handleStreamEnd();
    });

    return eventSource;
}