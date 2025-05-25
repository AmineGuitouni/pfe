// src/app/page.tsx (or any other component)
"use client";

import { useMemo, useState } from 'react';
// Adjust path if your AutoCompleteTextArea.tsx is in a different location, e.g., '../components/AutoCompleteTextArea'
import AutoCompleteTextArea, { Command } from './AutoCompleteTextArea'; 
import { useParams, usePathname } from 'next/navigation';
import { useCommandCenterContext } from '../context/CommandCenterContext';
import { Button } from '@heroui/react';

const predefinedCommands: Command[] = [
  {
    name: "deploy_app",
    description: "Deploys an application.",
    parameters: [
      { name: "--version", description: "Application version to deploy", placeholder: "1.0.0" },
      { name: "--branch", description: "Git branch to deploy from", placeholder: "main" },
    ],
  },
  {
    name: "get_logs",
    description: "Fetches logs for a service.",
    parameters: [
      { name: "--service", description: "Name of the service", placeholder: "api-gateway" },
      { name: "--since", description: "Fetch logs since a specific time", placeholder: "1h or YYYY-MM-DD" },
      // If -l was meant to take a value, it should be a parameter:
      // { name: "--lines", description: "Number of lines to fetch", placeholder: "100" },
    ],
  },
  {
    name: "user_create",
    description: "Creates a new user.",
    parameters: [
      { name: "--email", description: "User's email address", placeholder: "user@example.com" },
      { name: "--name", description: "User's full name", placeholder: "John Doe" },
      { name: "--role", description: "User's role", placeholder: "editor" },
    ],
  },
];

export default function CommandInput() {
  const [textValue, setTextValue] = useState('');
  const pathName = usePathname()
  const mode: "cli" | "chat" | null = useMemo(()=>{
    const isAgent = pathName.includes('chat')
    if(isAgent) return 'chat';
    const isCli = pathName.includes('cli')
    if(isCli) return 'cli';
    return null
  },[pathName])
  const autocompleteEnabled = useMemo(()=>{
    if(mode === 'cli') return true;
    if(mode === 'chat') return false;
    return textValue.startsWith("@");
  },[textValue, mode])

  const parseCommandString = (
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

  const {SendMessage, sendingMessage} = useCommandCenterContext();
  const {command_center_session} = useParams();

  const handleSubmit = () => {
    SendMessage(textValue)
    const result = parseCommandString(textValue, predefinedCommands);

    if ('error' in result) {
      console.error("Validation Error:", result.error);
    } else {
      console.log("Parsed Command:", result);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center">

      <div className="w-full max-w-2xl">
        <AutoCompleteTextArea
          value={textValue}
          onValueChange={setTextValue}
          commands={predefinedCommands}
          enableAutocomplete={autocompleteEnabled}
          placeholder="Type @ for commands..."
          rows={command_center_session ? 3 : 8}
          className="w-full p-3 bg-dark_blue text-white border border-light_blue-500/20 rounded-md focus:ring-2 focus:ring-light_blue-500 focus:border-light_blue-500 outline-none resize-none"
        />
        <Button
          onPress={handleSubmit}
          isDisabled={sendingMessage}
          isLoading={sendingMessage}
          className="bg-light_blue hover:bg-light_blue-500 text-black w-full"
        >
          Submit Command
        </Button>
      </div>
    </div>
  );
}
