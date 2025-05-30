import { Command } from "./component/AutoCompleteTextArea";

export const predefinedCommands: Command[] = [
  {
    name: "deploy_app",
    description: "Deploys an application.",
    parameters: [
      { name: "--version", description: "Application version to deploy", placeholder: "1.0.0" },
      { name: "--branch", description: "Git branch to deploy from", placeholder: "main" , isRequired: true},
    ],
  },
  {
    name: "get_logs",
    description: "Fetches logs for a service.",
    parameters: [
      { name: "--service", description: "Name of the service", placeholder: "api-gateway" },
      { name: "--since", description: "Fetch logs since a specific time", placeholder: "1h or YYYY-MM-DD" },
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