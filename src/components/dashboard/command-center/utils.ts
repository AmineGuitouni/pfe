import { Command } from "./component/AutoCompleteTextArea";

export const parseCommandString = (
    value: string,
    availableCommands: Command[]
  ): { command_name: string; parameters: Record<string, string> } | { error: string } => {
    const trimmedValue = value.trim();

    if (!trimmedValue.startsWith('@')) {
      return { error: "Invalid command format: Must start with '@'." };
    }

    const commandMatch = trimmedValue.match(/^@(\w+)/);
    if (!commandMatch || !commandMatch[1]) {
      return { error: "Invalid command format: Command name missing or invalid after '@'." };
    }

    const commandName = commandMatch[1];
    const commandDef = availableCommands.find(cmd => cmd.name === commandName);

    if (!commandDef) {
      return { error: `Unknown command: @${commandName}` };
    }

    const parsedOutput: { command_name: string; parameters: Record<string, string> } = {
      command_name: commandName,
      parameters: {},
    };

    const argString = trimmedValue.substring(commandMatch[0].length).trim();

    if (!argString) {
      // No arguments, command is valid (assuming no mandatory parameters for now)
      return parsedOutput;
    }

    const tokens: string[] = [];
    // Regex to split by space but respect quotes for values
    // It captures: 1. content of double quotes, 2. content of single quotes, or 0. unquoted sequence
    const tokenRegex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    let match;
    while ((match = tokenRegex.exec(argString)) !== null) {
      tokens.push(match[1] || match[2] || match[0]);
    }

    let i = 0;
    while (i < tokens.length) {
      const currentToken = tokens[i];

      if (currentToken.startsWith('--')) { // Parameter
        const paramDef = commandDef.parameters?.find(p => p.name === currentToken);
        if (!paramDef) {
          return { error: `Invalid parameter: ${currentToken} for command @${commandName}` };
        }
        if (i + 1 >= tokens.length) {
          return { error: `Parameter ${currentToken} expects a value, but none was found.` };
        }
        const paramValue = tokens[i + 1];
        // Store parameter name without '--'
        parsedOutput.parameters[paramDef.name.substring(2)] = paramValue;
        i += 2; // Consumed parameter name and value
      } else if (currentToken.startsWith('-') && !currentToken.startsWith('--')) { // Invalid single hyphen argument
        return { error: `Invalid argument: "${currentToken}". Only parameters (e.g., --param value) are supported.` };
      } 
      else {
        return { error: `Unexpected token: "${currentToken}". Arguments must be parameters (e.g., --param value).` };
      }
    }

    return parsedOutput;
  };