'use client';
import React, { useMemo } from 'react';
import { useFilesContext } from '../hooks/useFilesContext';
import FileComponent from './fileComponent';
import FolderComponent, { FolderSkeleton } from './folderComponent';

const FileCardContainer: React.FC = () => {
  const { searchTerm, files, folders, isLoading } = useFilesContext();

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

  if(isLoading){
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {
          Array.from({ length: 3 }).map((_, index) => <FolderSkeleton key={index} index={index} /> )
        }
      </div>
    )
  }

  if (filteredFiles.length === 0 && filteredFolders.length === 0) {
    return <p className="text-gray-400 text-center py-10">
      {searchTerm ? 'No matching files or folders found.' : 'This folder is empty.'}
    </p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {
        filteredFolders.map((item, index) => (
          <FolderComponent key={item.id} folder={item} index={index} />
        ))
      }
      {
        filteredFiles.map((item, index) => (
          <FileComponent key={item.id} file={item} index={index + filteredFolders.length} />
        ))
      }
    </div>
  );
};

export default FileCardContainer;