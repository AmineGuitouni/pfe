# Command Center Voice/Audio API Tutorial

## Overview
The Command Center API supports voice/audio input alongside text messages, allowing users to send audio recordings that are processed by the AI system. This guide covers how to integrate voice functionality into your applications using the Command Center API.

## Audio Format Requirements

### Supported Formats
- **WAV** (recommended)
- **MP3**
- **FLAC**
- **M4A**
- **OGG**
- **PCM**

### Base64 Encoding Format
Audio data must be sent as a base64-encoded data URI with the following structure:
```
data:audio/[type];base64,[base64-encoded-data]
```

**Examples:**
```
data:audio/wav;base64,GkXfo59ChoEBQveBAULMgg...
data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAA...
data:audio/ogg;base64,T2dnUwACAAAAAAAAAAC8Gw...
```

### Audio Requirements
- **Maximum file size**: Recommended under 10MB
- **Duration**: No strict limit, but shorter recordings process faster
- **Sample rate**: Any standard rate (8kHz, 16kHz, 44.1kHz, 48kHz)
- **Encoding**: Must be valid base64 data

## API Usage

### Request Structure
Send audio messages using the same endpoint as text messages, but with different parameters:

```http
POST /api/v1/{user_id}/companies/{company_id}/command-center/sessions/{session_id}
Content-Type: application/json

{
  "user_prompt": "data:audio/wav;base64,GkXfo59ChoEBQveBAUL...",
  "user_content_type": "audio"
}
```

### Request Parameters
- **`user_prompt`** (string): Base64-encoded audio data URI
- **`user_content_type`** (string): Must be `"audio"` for voice messages
- **`accept_tool_call`** (boolean, optional): Accept pending tool calls
- **`reject_tool_call`** (boolean, optional): Reject pending tool calls

### Response Format
The API returns the same response structure as text messages:

```json
{
  "response": "AI response text based on audio input",
  "response_id": "message-uuid",
  "user_message_id": "user-message-uuid"
}
```