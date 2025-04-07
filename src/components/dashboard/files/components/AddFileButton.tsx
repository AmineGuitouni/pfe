'use client';

import React from 'react';
import { Button } from "@heroui/react"; // Import Button
import { Upload } from "lucide-react"; // Import Upload icon

const AddFileButton: React.FC = () => {
  const handleUpload = () => {
    // TODO: Implement file upload logic
    console.log('Upload button clicked');
    // Potentially trigger an input type="file" click or open a modal
  };

  return (
    <Button
      size="sm"
      className="dark bg-light_blue-500/10 hover:bg-light_blue-500/20 w-fit flex-shrink-0" // Apply styles from AddGroupButton
      startContent={<Upload className="w-4 h-4" />} // Use Upload icon
      onPress={handleUpload}
      title="Upload File"
    >
      Upload File
    </Button>
  );
};

export default AddFileButton;