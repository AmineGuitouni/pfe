'use client'; // Add this directive

import React from 'react';
// import { useFiles } from '../hooks/useFiles'; // Import hook later to get selected file details

const FileDetailsContainer: React.FC = () => {
  // const { selectedFile } = useFiles(); // Get selected file from context/hook

  // if (!selectedFile) {
  //   return <p className="text-gray-400">Select a file or folder to see details.</p>;
  // }

  // Placeholder content
  const selectedFile = {
    name: 'report-final.docx',
    type: 'file',
    size: '1.2 MB',
    modified: 'Yesterday',
    owner: 'You',
  };

  return (
    <div className="text-light_blue space-y-4">
      <h3 className="text-lg font-semibold border-b border-light_blue-500/20 pb-2 mb-4">
        {selectedFile.name}
      </h3>
      <div>
        <span className="font-medium text-light_blue-500">Type:</span> {selectedFile.type === 'file' ? 'File' : 'Folder'}
      </div>
      {selectedFile.type === 'file' && (
        <div>
          <span className="font-medium text-light_blue-500">Size:</span> {selectedFile.size}
        </div>
      )}
      <div>
        <span className="font-medium text-light_blue-500">Last Modified:</span> {selectedFile.modified}
      </div>
      <div>
        <span className="font-medium text-light_blue-500">Owner:</span> {selectedFile.owner}
      </div>
      {/* Add more details or actions (e.g., download, share, delete) later */}
    </div>
  );
};

export default FileDetailsContainer;