import { ToolCall } from "@/components/dashboard/command-center/component/toolUseDisplay";

export const parseMessageWithToolUse = (text: string) => {
  const toolUseRegex = /```tool_use\s*([\s\S]*?)\s*```/;
  const match = text.match(toolUseRegex);

  if (match && typeof match.index === 'number' && typeof match[1] === 'string') {
    const toolCallJsonString = match[1];

    try {
      const parsedJson = JSON.parse(toolCallJsonString);
      if (
        typeof parsedJson !== 'object' ||
        parsedJson === null ||
        typeof parsedJson.name !== 'string' ||
        typeof parsedJson.parameters !== 'object' || // parameters can be an empty object
        parsedJson.parameters === null
      ) {
        console.warn("Parsed tool_use JSON has an unexpected structure:", parsedJson);
        throw new Error("Parsed tool_use JSON has an unexpected structure");
      }
      const parsedToolCall = parsedJson as ToolCall;
      return parsedToolCall;
    } catch (error) {
      console.error(
        "Failed to parse or validate tool_use JSON:", error,
        "\nJSON string was:", toolCallJsonString,
        "\nOriginal text:", text
      );
      
      return undefined
    }
  }
  
  return undefined
};