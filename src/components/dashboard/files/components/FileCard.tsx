'use client'; // Add this directive

import React from 'react';
// import { useFiles } from '../hooks/useFiles'; // Import hook later for selection

// Define basic types for props, will be refined in filesTypes.ts later
interface FileCardProps {
  id: string;
  name: string;
  type: 'file' | 'folder';
  // Add other relevant props like size, modified date, etc. later
}

const FileCard: React.FC<FileCardProps> = ({ id, name, type }) => {
  // const { selectFile } = useFiles(); // Get selection function later
  const isFolder = type === 'folder';

  const Icon = isFolder ? (
    // Folder Icon
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-light_blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ) : (
    // File Icon (Generic)
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-light_blue mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );

  const handleClick = () => {
    // TODO: Implement selection logic using selectFile from context
    console.log(`Selected: ${name} (ID: ${id}, Type: ${type})`);
    // selectFile({ id, name, type /* ... other props */ });
  };

  return (
    <div
      key={id}
      // Adjusted padding, added justify-center and min-height for consistency
      className="bg-dark_blue p-4 rounded-lg border border-light_blue-500/20 cursor-pointer hover:bg-light_blue-500/10 transition-colors flex flex-col items-center justify-center text-center min-h-[120px]"
      onClick={handleClick}
    >
      {Icon}
      <span className="text-sm text-light_blue truncate block w-full mt-2">{name}</span> {/* Added margin top */}
      {/* Add more details like size/date if needed */}
    </div>
  );
};

export default FileCard;