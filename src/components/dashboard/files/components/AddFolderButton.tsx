'use client';

import React from 'react';
import { FaFolderPlus } from 'react-icons/fa'; // Use react-icons

const AddFolderButton: React.FC = () => {
  const handleCreateFolder = () => {
    // TODO: Implement folder creation logic (e.g., show a modal to enter name)
    console.log('Create Folder button clicked');
    // Potentially call a function from useFiles context
  };

  return (
    <button
      onClick={handleCreateFolder}
      className="flex items-center bg-light_blue-500/20 text-light_blue-500 px-4 py-2 rounded-md hover:bg-light_blue-500/30 transition-colors border border-light_blue-500/50"
      title="Create New Folder" // Tooltip for clarity
    >
      <FaFolderPlus className="h-5 w-5 mr-2" /> {/* Updated Icon */}
      <span>Create Folder</span>
    </button>
  );
};

export default AddFolderButton;