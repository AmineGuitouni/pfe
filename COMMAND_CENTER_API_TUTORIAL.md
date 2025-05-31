# Command Center API Usage Tutorial - Client Integration Guide

## API Overview
The Command Center API provides conversational AI capabilities with session management and tool calling features. This tutorial shows how to integrate with the API from external applications.

## Base API Structure
```
Base URL: {your-domain}/api/v1/{user_id}/companies/{company_id}/command-center
```

## Authentication Requirements
- User must be authenticated (JWT/session-based)
- User must have access to the specified company
- All requests require valid `user_id` and `company_id` parameters

## API Endpoints Reference

### 1. Create New Session
```http
POST /api/v1/{user_id}/companies/{company_id}/command-center/sessions/new
Content-Type: application/json

{
  "name": "My Conversation",
  "mode": "chat"  // or "cli"
}
```

**Response:**
```json
{
  "data": {
    "session_id": "uuid-session-id"
  }
}
```

### 2. List User Sessions
```http
GET /api/v1/{user_id}/companies/{company_id}/command-center/sessions/list
```

**Response:**
```json
{
  "data": {
    "sessions": [
      {
        "id": "session-uuid",
        "name": "Session Name",
        "mode": "chat",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 3. Send Message to Session
```http
POST /api/v1/{user_id}/companies/{company_id}/command-center/sessions/{session_id}
Content-Type: application/json

{
  "user_prompt": "Hello, how can you help me?"
}
```

**Response:**
```json
{
  "response": "AI response text",
  "response_id": "message-uuid",
  "user_message_id": "user-message-uuid"
}
```

### 4. Handle Tool Calls (Accept/Reject)
```http
POST /api/v1/{user_id}/companies/{company_id}/command-center/sessions/{session_id}
Content-Type: application/json

{
  "accept_tool_call": true  // or "reject_tool_call": true
}
```

**Response:**
```json
{
  "response": "AI response after tool execution",
  "response_id": "response-uuid",
  "toolCallMessage": {
    "id": "tool-message-uuid",
    "content": "Tool execution result"
  }
}
```

### 5. Get Session Messages
```http
GET /api/v1/{user_id}/companies/{company_id}/command-center/sessions/{session_id}/messages
```

**Response:**
```json
{
  "data": [
    {
      "id": "message-uuid",
      "session_id": "session-uuid",
      "sender": "user",  // "user" | "ai" | "tool"
      "content": "Message content",
      "created_at": "2024-01-01T00:00:00.000Z",
      "type": "text"  // "text" | "audio"
    }
  ]
}
```

## Tool Call Detection and Handling

### Understanding Tool Calls
The AI assistant can use tools to perform specific actions. When the AI wants to use a tool, it includes a special syntax in its response that your client needs to detect and handle.

### Tool Call Syntax
When the AI wants to use a tool, it will include the following syntax in its response:

```
```tool_use
{
    "name": "tool_name",
    "parameters": {
        "parameter_1": {
            "type": "string",
            "value": "parameter_value"
        },
        "parameter_2": {
            "type": "number", 
            "value": 42
        }
    }
}
```
```

### Tool Result Syntax
After a tool is executed, the result is returned in this format:

```
```tool_result
{
    "name": "tool_name",
    "output": "result of the tool execution"
}
```
```

### Tool Call Detection Functions

#### JavaScript/TypeScript Implementation
```typescript
interface ToolCall {
  name: string;
  parameters: Record<string, {
    type: string;
    value: any;
  }>;
}

function detectToolCall(aiResponse: string): ToolCall | null {
  const toolUseRegex = /```tool_use\s*([\s\S]*?)\s*```/;
  const match = aiResponse.match(toolUseRegex);

  if (match && match[1]) {
    try {
      const parsedJson = JSON.parse(match[1]);
      
      // Validate structure
      if (
        typeof parsedJson !== 'object' ||
        parsedJson === null ||
        typeof parsedJson.name !== 'string' ||
        typeof parsedJson.parameters !== 'object' ||
        parsedJson.parameters === null
      ) {
        console.warn("Invalid tool_use JSON structure:", parsedJson);
        return null;
      }
      
      return parsedJson as ToolCall;
    } catch (error) {
      console.error("Failed to parse tool_use JSON:", error);
      return null;
    }
  }
  
  return null;
}

function detectToolResult(message: string): { name: string; output: string } | null {
  const toolResultRegex = /```tool_result\s*([\s\S]*?)\s*```/;
  const match = message.match(toolResultRegex);

  if (match && match[1]) {
    try {
      const parsedJson = JSON.parse(match[1]);
      
      if (
        typeof parsedJson !== 'object' ||
        parsedJson === null ||
        typeof parsedJson.name !== 'string' ||
        typeof parsedJson.output === 'undefined'
      ) {
        console.warn("Invalid tool_result JSON structure:", parsedJson);
        return null;
      }
      
      return parsedJson;
    } catch (error) {
      console.error("Failed to parse tool_result JSON:", error);
      return null;
    }
  }
  
  return null;
}
```

#### Python Implementation
```python
import re
import json
from typing import Dict, Any, Optional

def detect_tool_call(ai_response: str) -> Optional[Dict[str, Any]]:
    """Detect if AI response contains a tool call."""
    pattern = r'```tool_use\s*([\s\S]*?)\s*```'
    match = re.search(pattern, ai_response)
    
    if match:
        try:
            tool_json = json.loads(match.group(1))
            
            # Validate structure
            if (not isinstance(tool_json, dict) or 
                'name' not in tool_json or 
                'parameters' not in tool_json):
                print(f"Invalid tool_use structure: {tool_json}")
                return None
                
            return tool_json
        except json.JSONDecodeError as e:
            print(f"Failed to parse tool_use JSON: {e}")
            return None
    
    return None

def detect_tool_result(message: str) -> Optional[Dict[str, Any]]:
    """Detect if message contains a tool result."""
    pattern = r'```tool_result\s*([\s\S]*?)\s*```'
    match = re.search(pattern, message)
    
    if match:
        try:
            result_json = json.loads(match.group(1))
            
            # Validate structure
            if (not isinstance(result_json, dict) or 
                'name' not in result_json or 
                'output' not in result_json):
                print(f"Invalid tool_result structure: {result_json}")
                return None
                
            return result_json
        except json.JSONDecodeError as e:
            print(f"Failed to parse tool_result JSON: {e}")
            return None
    
    return None
```

## Integration Examples

### Complete JavaScript/TypeScript Client
```typescript
class CommandCenterClient {
  constructor(
    private baseUrl: string,
    private userId: string,
    private companyId: string
  ) {}

  private get apiBase() {
    return `${this.baseUrl}/api/v1/${this.userId}/companies/${this.companyId}/command-center`;
  }

  async createSession(name: string, mode: 'chat' | 'cli' = 'chat') {
    const response = await fetch(`${this.apiBase}/sessions/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mode })
    });
    return response.json();
  }

  async sendMessage(sessionId: string, message: string) {
    const response = await fetch(`${this.apiBase}/sessions/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_prompt: message })
    });
    return response.json();
  }

  async acceptToolCall(sessionId: string) {
    const response = await fetch(`${this.apiBase}/sessions/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept_tool_call: true })
    });
    return response.json();
  }

  async rejectToolCall(sessionId: string) {
    const response = await fetch(`${this.apiBase}/sessions/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reject_tool_call: true })
    });
    return response.json();
  }

  async getMessages(sessionId: string) {
    const response = await fetch(`${this.apiBase}/sessions/${sessionId}/messages`);
    return response.json();
  }

  async listSessions() {
    const response = await fetch(`${this.apiBase}/sessions/list`);
    return response.json();
  }

  // Helper method to handle AI responses with tool calls
  async handleAIResponse(sessionId: string, aiResponse: string) {
    const toolCall = detectToolCall(aiResponse);
    
    if (toolCall) {
      console.log(`AI wants to use tool: ${toolCall.name}`);
      console.log('Parameters:', toolCall.parameters);
      
      // You can implement custom logic here to decide whether to accept or reject
      // For example, show a confirmation dialog to the user
      const userApproval = await this.getUserApproval(toolCall);
      
      if (userApproval) {
        return await this.acceptToolCall(sessionId);
      } else {
        return await this.rejectToolCall(sessionId);
      }
    }
    
    return { response: aiResponse }; // No tool call detected
  }

  private async getUserApproval(toolCall: ToolCall): Promise<boolean> {
    // Implement your approval logic here
    // This could be a dialog, console prompt, etc.
    return confirm(`Allow AI to use tool "${toolCall.name}"?`);
  }
}
```

### Python Client Example
```python
import requests
from typing import Dict, List, Optional

class CommandCenterClient:
    def __init__(self, base_url: str, user_id: str, company_id: str):
        self.base_url = base_url
        self.user_id = user_id
        self.company_id = company_id
        self.api_base = f"{base_url}/api/v1/{user_id}/companies/{company_id}/command-center"
    
    def create_session(self, name: str, mode: str = "chat") -> Dict:
        response = requests.post(
            f"{self.api_base}/sessions/new",
            json={"name": name, "mode": mode}
        )
        return response.json()
    
    def send_message(self, session_id: str, message: str) -> Dict:
        response = requests.post(
            f"{self.api_base}/sessions/{session_id}",
            json={"user_prompt": message}
        )
        return response.json()
    
    def accept_tool_call(self, session_id: str) -> Dict:
        response = requests.post(
            f"{self.api_base}/sessions/{session_id}",
            json={"accept_tool_call": True}
        )
        return response.json()
    
    def reject_tool_call(self, session_id: str) -> Dict:
        response = requests.post(
            f"{self.api_base}/sessions/{session_id}",
            json={"reject_tool_call": True}
        )
        return response.json()
    
    def get_messages(self, session_id: str) -> Dict:
        response = requests.get(f"{self.api_base}/sessions/{session_id}/messages")
        return response.json()

    def handle_ai_response(self, session_id: str, ai_response: str) -> Dict:
        """Handle AI response and check for tool calls."""
        tool_call = detect_tool_call(ai_response)
        
        if tool_call:
            print(f"AI wants to use tool: {tool_call['name']}")
            print(f"Parameters: {tool_call['parameters']}")
            
            # Get user approval (implement your own logic)
            approval = self.get_user_approval(tool_call)
            
            if approval:
                return self.accept_tool_call(session_id)
            else:
                return self.reject_tool_call(session_id)
        
        return {"response": ai_response}
    
    def get_user_approval(self, tool_call: Dict) -> bool:
        """Get user approval for tool execution."""
        response = input(f"Allow AI to use tool '{tool_call['name']}'? (y/n): ")
        return response.lower().startswith('y')
```

## Usage Flow Examples

### Basic Chat Flow
```typescript
// 1. Create a new session
const { data: { session_id } } = await client.createSession("Help with API", "chat");

// 2. Send a message
const response = await client.sendMessage(session_id, "How do I integrate with your API?");

// 3. Check for tool calls and handle AI response
const finalResponse = await client.handleAIResponse(session_id, response.response);
console.log(finalResponse.response); // AI response

// 4. Get conversation history
const { data: messages } = await client.getMessages(session_id);
```

### Tool Call Handling Flow
```typescript
// 1. Send message that might trigger tool use
const response = await client.sendMessage(session_id, "Create a new project for mobile app development");

// 2. Check if response contains tool call request
const toolCall = detectToolCall(response.response);

if (toolCall) {
  console.log(`AI wants to use tool: ${toolCall.name}`);
  console.log('Tool parameters:', toolCall.parameters);
  
  // 3. Show approval UI to user
  const userApproved = await showToolApprovalDialog(toolCall);
  
  // 4. Handle user decision
  if (userApproved) {
    const toolResponse = await client.acceptToolCall(session_id);
    console.log('Tool executed successfully:', toolResponse.response);
  } else {
    const rejectedResponse = await client.rejectToolCall(session_id);
    console.log('Tool rejected:', rejectedResponse.response);
  }
} else {
  // Normal AI response without tool use
  console.log('AI Response:', response.response);
}
```

### Message Processing with Tool Detection
```typescript
async function processMessage(sessionId: string, userMessage: string) {
  try {
    // Send user message
    const response = await client.sendMessage(sessionId, userMessage);
    
    if (response.error) {
      console.error('API Error:', response.error);
      return;
    }
    
    // Check for tool calls
    const toolCall = detectToolCall(response.response);
    
    if (toolCall) {
      // Handle tool call workflow
      return await handleToolCall(sessionId, toolCall);
    } else {
      // Regular AI response
      return {
        type: 'ai_response',
        content: response.response,
        messageId: response.response_id
      };
    }
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

async function handleToolCall(sessionId: string, toolCall: ToolCall) {
  // Show tool approval UI
  const approved = await showToolApprovalUI(toolCall);
  
  if (approved) {
    const result = await client.acceptToolCall(sessionId);
    return {
      type: 'tool_executed',
      content: result.response,
      toolCall: toolCall,
      toolResult: result.toolCallMessage
    };
  } else {
    const result = await client.rejectToolCall(sessionId);
    return {
      type: 'tool_rejected',
      content: result.response,
      toolCall: toolCall
    };
  }
}
```

## Error Handling
```typescript
try {
  const response = await client.sendMessage(sessionId, message);
  if (response.error) {
    console.error('API Error:', response.error);
    return;
  }
  // Handle success
} catch (error) {
  console.error('Network Error:', error);
}
```

## Common Error Responses
- `400`: Missing required fields or invalid company ID
- `404`: Session not found
- `500`: Database or internal server error
- `501`: CLI mode not implemented yet

## Available Tools
The system currently supports these tools:
- **generate_tasks_for_project**: Generate AI-powered tasks for projects
- **create_project**: Create complete projects with tasks
- **assign_users_to_project**: Assign users to project tasks
- **list_projects**: Retrieve company projects
- **get_project**: Get detailed project information
- **list_users**: Retrieve company users with filtering
- **send_email**: Send formatted emails
- **generate_task_assignments**: AI-powered task assignments

## Best Practices

### 1. Session Management
- Reuse sessions for continued conversations
- Create new sessions for different topics/contexts
- Clean up old sessions periodically

### 2. Error Handling
- Always check for error fields in responses
- Implement retry logic for network failures
- Handle tool call parsing errors gracefully

### 3. Tool Call Management
- **Always implement user approval workflow** for tool execution
- Validate tool parameters before approval
- Provide clear descriptions of what tools will do
- Log tool execution for audit purposes

### 4. Performance Optimization
- Fetch messages only when needed to avoid unnecessary load
- Implement client-side caching for sessions
- Use pagination for large conversation histories

### 5. Security Considerations
- Validate user permissions before allowing tool calls
- Sanitize tool parameters
- Implement rate limiting to prevent abuse
- Log all tool executions for security auditing

### 6. User Experience
- Show loading indicators during API calls
- Implement optimistic UI updates for better responsiveness
- Provide clear feedback for tool call approvals/rejections
- Handle network timeouts gracefully

## Advanced Integration Patterns

### Real-time Updates with Polling
```typescript
class RealtimeCommandCenter extends CommandCenterClient {
  private pollingInterval: NodeJS.Timeout | null = null;
  
  startPolling(sessionId: string, callback: (messages: any[]) => void, interval = 5000) {
    this.pollingInterval = setInterval(async () => {
      try {
        const { data: messages } = await this.getMessages(sessionId);
        callback(messages);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);
  }
  
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}
```

### Batch Operations
```typescript
async function createProjectWithTasks(client: CommandCenterClient, sessionId: string) {
  // 1. Generate tasks
  const taskResponse = await client.sendMessage(
    sessionId, 
    "Generate tasks for a mobile e-commerce application project"
  );
  
  // 2. Handle tool call for task generation
  if (detectToolCall(taskResponse.response)) {
    const taskResult = await client.acceptToolCall(sessionId);
    
    // 3. Create project with generated tasks
    const projectResponse = await client.sendMessage(
      sessionId,
      "Now create the project with those generated tasks"
    );
    
    // 4. Handle project creation tool call
    if (detectToolCall(projectResponse.response)) {
      return await client.acceptToolCall(sessionId);
    }
  }
}
```

This tutorial provides everything needed to integrate with the Command Center API, including proper tool call detection and handling patterns.