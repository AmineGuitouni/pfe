import { Command } from "../component/AutoCompleteTextArea";


export const predefinedCommands: Command[] = [
  {
    name: "projects_list",
    description: "Lists all projects.",
  },
  {
    name: "users_list",
    description: "Lists all users.",
    parameters: [
      { name: "--name", description: "Filter users by name", placeholder: "John Doe" },
      { name: "--page", description: "Page number for pagination", placeholder: "1" },
    ],
  },
  {
    name: "groups_list",
    description: "Lists all permission groups.",
  },
  {
    name: "create_project",
    description: "Creates a new project.",
    parameters: [
      { name: "--name", description: "Name of the project", placeholder: "Project Name", isRequired: true },
      { name: "--description", description: "Description of the project", placeholder: "Project Description", isRequired: true  },
    ],
  }
];