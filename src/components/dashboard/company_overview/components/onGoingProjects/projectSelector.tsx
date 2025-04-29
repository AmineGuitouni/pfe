import React from 'react';
import { projectData } from '../../hooks/useCompanyOverview'; // Import the correct type

interface ProjectSelectorProps {
  projects: projectData[] | null; // Accept the list of projects
  selectedProjectId: string | null; // Accept the selected project ID
  onProjectSelect: (projectId: string) => void; // Callback for selection change
  isLoading?: boolean; // Optional loading state from parent
}

export default function ProjectSelector({
  projects,
  selectedProjectId,
  onProjectSelect,
  isLoading = false // Default loading to false
}: ProjectSelectorProps) {

  if (isLoading) {
    return <div className="text-sm text-white/60">Loading projects...</div>;
  }

  if (!projects || projects.length === 0) {
    return <div className="text-sm text-white/60">No projects available.</div>;
  }

  return (
    <div className="flex-shrink-0"> {/* Prevent selector from growing too large */}
      <select
        value={selectedProjectId || ""}
        onChange={(e) => {
          if (e.target.value) { // Ensure a valid project is selected
            onProjectSelect(e.target.value);
          }
        }}
        className="bg-white/10 text-white/90 border border-white/20 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-light_blue focus:border-light_blue appearance-none w-full sm:w-auto min-w-[150px]" // Adjusted styling
        aria-label="Select a Project"
        disabled={isLoading} // Disable while loading
      >
        <option value="" disabled className="text-gray-500">-- Select Project --</option>
        {projects.map((project) => (
          <option key={project.id_project} value={project.id_project} className="bg-gray-800 text-white">
            {project.name} {/* Use name from projectData */}
          </option>
        ))}
      </select>
    </div>
  );
}