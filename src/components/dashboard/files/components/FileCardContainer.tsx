'use client';
import React, { useMemo } from 'react';
import { useFilesContext } from '../hooks/useFilesContext';
import FileComponent from './fileComponent';
import FolderComponent from './folderComponent';


const FileCardContainer: React.FC = () => {
  const { searchTerm, files, folders } = useFilesContext();

  const { filteredFiles, filteredFolders} = useMemo(() => {
    if (!searchTerm) {
      return { filteredFiles: files, filteredFolders: folders };
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filteredFiles = files.filter(file =>
      file.name.toLowerCase().includes(lowerCaseSearchTerm)
    );

    const filteredFolders = folders.filter(file =>
      file.name.toLowerCase().includes(lowerCaseSearchTerm)
    );

    return { filteredFiles, filteredFolders }
  }, [files, searchTerm, folders]);


  if (!filteredFiles || filteredFiles.length === 0) {
    return <p className="text-gray-400 text-center py-10">
      {searchTerm ? 'No matching files or folders found.' : 'This folder is empty.'}
    </p>;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {filteredFolders.map((item, index) => (
        <FolderComponent key={item.id} folder={item} index={index} />
      ))}
      {filteredFiles.map((item, index) => (
        <FileComponent key={item.id} file={item} index={index} />
      ))}
    </div>
  );
};

export default FileCardContainer;