'use client';

import React from 'react';
import { Button } from "@heroui/react"; // Import Button
import { FolderPlus } from "lucide-react"; // Import FolderPlus icon

const AddFolderButton: React.FC = () => {
  const handleCreateFolder = () => {
    // TODO: Implement folder creation logic (e.g., show a modal to enter name)
    console.log('Create Folder button clicked');
    // Potentially call a function from useFiles context
  };

  return (
    <Button
      size="sm"
      className="dark bg-light_blue-500/10 hover:bg-light_blue-500/20 w-fit flex-shrink-0" // Apply styles from AddGroupButton
      startContent={<FolderPlus className="w-4 h-4" />} // Use FolderPlus icon
      onPress={handleCreateFolder}
      title="Create New Folder"
    >
      Create Folder
    </Button>
  );
};

export default AddFolderButton;