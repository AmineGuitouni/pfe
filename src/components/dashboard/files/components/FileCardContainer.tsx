'use client'; // Add this directive

import React, { useMemo } from 'react'; // Import useMemo
import FileCard from './FileCard';
import { useFiles } from '../hooks/useFiles'; // Import the hook
import { FileItem } from '../types/filesTypes';

const placeholderFiles: FileItem[] = [
  { id: 'folder1', name: 'Project Documents', type: 'folder', path: '/Project Documents', createdAt: new Date(), modifiedAt: new Date() },
  { id: 'folder2', name: 'Images', type: 'folder', path: '/Images', createdAt: new Date(), modifiedAt: new Date() },
  { id: 'file1', name: 'report-final.docx', type: 'file', path: '/report-final.docx', size: 123456, createdAt: new Date(), modifiedAt: new Date() },
  { id: 'file2', name: 'meeting_notes.txt', type: 'file', path: '/meeting_notes.txt', size: 5678, createdAt: new Date(), modifiedAt: new Date() },
  { id: 'file3', name: 'logo.png', type: 'file', path: '/Images/logo.png', size: 98765, createdAt: new Date(), modifiedAt: new Date() },
  { id: 'file4', name: 'presentation.pptx', type: 'file', path: '/Project Documents/presentation.pptx', size: 1234567, createdAt: new Date(), modifiedAt: new Date() },
];

const FileCardContainer: React.FC = () => {
  const { searchTerm } = useFiles();
  const files = placeholderFiles;

  const filteredFiles = useMemo(() => {
    if (!searchTerm) {
      return files;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return files.filter(file =>
      file.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [files, searchTerm]);


  if (!filteredFiles || filteredFiles.length === 0) {
    return <p className="text-gray-400 text-center py-10">
      {searchTerm ? 'No matching files or folders found.' : 'This folder is empty.'}
    </p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredFiles.map((file) => (
        <FileCard key={file.id} id={file.id} name={file.name} type={file.type} />
      ))}
    </div>
  );
};

export default FileCardContainer;