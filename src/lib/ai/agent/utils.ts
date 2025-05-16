interface RawToolUse {
  name: string;
  parameters: {
    [key: string]: any;
  };
}

interface ExtractedToolCall {
  tool_name: string;
  parameters: {
    [key: string]: any;
  };
}

export function extractToolUse(jsonString: string): ExtractedToolCall | null {
  const toolUseJsonString = jsonString.trim();

  try {
    const rawToolUse: RawToolUse = JSON.parse(toolUseJsonString);

    const transformedParameters: { [key: string]: any } = {};
    if (rawToolUse.parameters) {
      for (const key in rawToolUse.parameters) {
        if (Object.prototype.hasOwnProperty.call(rawToolUse.parameters, key)) {
          if (rawToolUse.parameters[key] && typeof rawToolUse.parameters[key].value !== 'undefined') {
            transformedParameters[key] = rawToolUse.parameters[key].value;
          } else {
            transformedParameters[key] = rawToolUse.parameters[key];
          }
        }
      }
    }

    const extractedCall: ExtractedToolCall = {
      tool_name: rawToolUse.name,
      parameters: transformedParameters,
    };

    return extractedCall;
  } catch (error) {
    console.error('Error parsing tool use JSON:', error);
    return null;
  }
}