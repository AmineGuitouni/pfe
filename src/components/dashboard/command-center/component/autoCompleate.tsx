// src/app/page.tsx (or any other component)
"use client";

import { useState } from 'react';
// Adjust path if your AutoCompleteTextArea.tsx is in a different location, e.g., '../components/AutoCompleteTextArea'
import AutoCompleteTextArea, { Command } from './AutoCompleteTextArea'; 

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
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const [submissionResult, setSubmissionResult] = useState<string | null>(null);

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

  const handleSubmit = () => {
    const result = parseCommandString(textValue, predefinedCommands);

    if ('error' in result) {
      console.error("Validation Error:", result.error);
      setSubmissionResult(`Error: ${result.error}`);
    } else {
      console.log("Parsed Command:", result);
      setSubmissionResult(`Success: ${JSON.stringify(result, null, 2)}`);
    }
  };

  return (
    <div className="min-h-screen bg-dark_blue p-8 flex flex-col items-center">
      <h1 className="text-3xl text-light_blue mb-6">Command Input</h1>
      
      <div className="w-full max-w-2xl mb-4">
        <label className="flex items-center space-x-2 text-light_blue mb-2">
          <input
            type="checkbox"
            checked={autocompleteEnabled}
            onChange={(e) => setAutocompleteEnabled(e.target.checked)}
            className="form-checkbox h-5 w-5 text-light_blue-500 bg-dark_blue border-light_blue rounded focus:ring-light_blue-500"
          />
          <span>Enable Autocomplete</span>
        </label>
      </div>

      <div className="w-full max-w-2xl">
        <AutoCompleteTextArea
          value={textValue}
          onValueChange={setTextValue}
          commands={predefinedCommands}
          enableAutocomplete={autocompleteEnabled}
          placeholder="Type @ for commands..."
          rows={8}
          // The className prop here might override/conflict with internal styles of AutoCompleteTextArea.
          // It's generally better to rely on the component's own styling or pass specific style props if needed.
          // For this example, it's kept as provided in the original snippet.
          className="w-full p-3 bg-dark_blue text-white border border-light_blue-500/20 rounded-md focus:ring-2 focus:ring-light_blue-500 focus:border-light_blue-500 outline-none resize-none"
        />
        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-light_blue-600 hover:bg-light_blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }} // Example Tailwind blue-600
        >
          Submit Command
        </button>
      </div>

      {submissionResult && (
        <div className="mt-6 p-4 bg-modal_bg rounded-md w-full max-w-2xl">
          <h2 className="text-light_blue mb-2">Submission Result:</h2>
          <pre className="text-white whitespace-pre-wrap break-all text-sm">
            {submissionResult}
          </pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-modal_bg rounded-md w-full max-w-2xl">
        <h2 className="text-light_blue mb-2">Current Value (for debugging):</h2>
        <pre className="text-white whitespace-pre-wrap break-all text-sm">
          {textValue || "Empty"}
        </pre>
      </div>
    </div>
  );
}
