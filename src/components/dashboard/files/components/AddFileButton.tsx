'use client'; // Add this directive

import React from 'react';

const AddFileButton: React.FC = () => {
  const handleUpload = () => {
    // TODO: Implement file upload logic
    console.log('Upload button clicked');
  };

  return (
    <button
      onClick={handleUpload}
      className="bg-light_blue-500 text-dark_blue px-4 py-2 rounded-md hover:bg-light_blue transition-colors"
    >
      Upload File
    </button>
  );
};

export default AddFileButton;