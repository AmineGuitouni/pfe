-- Migration: Add tool call columns for OpenAI native tool calling support
-- This migration adds columns to support the new tool calling format

-- Add tool_calls column for storing AI tool call requests (array of tool calls)
ALTER TABLE command_center_sessions_messages 
ADD COLUMN IF NOT EXISTS tool_calls JSONB;

-- Add tool_call_id column for tool result messages (links result to specific tool call)
ALTER TABLE command_center_sessions_messages 
ADD COLUMN IF NOT EXISTS tool_call_id TEXT;

-- Add tool_name column for tool result messages (name of the executed tool)
ALTER TABLE command_center_sessions_messages 
ADD COLUMN IF NOT EXISTS tool_name TEXT;

-- Add an index for faster lookups by tool_call_id
CREATE INDEX IF NOT EXISTS idx_messages_tool_call_id 
ON command_center_sessions_messages(tool_call_id) 
WHERE tool_call_id IS NOT NULL;

-- Comment on the new columns
COMMENT ON COLUMN command_center_sessions_messages.tool_calls IS 'JSON array of OpenAI tool calls requested by the AI';
COMMENT ON COLUMN command_center_sessions_messages.tool_call_id IS 'ID linking tool result to original tool call request';
COMMENT ON COLUMN command_center_sessions_messages.tool_name IS 'Name of the tool that was executed';
