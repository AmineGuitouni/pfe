'use client';

import React, { createContext, useState, useMemo, ReactNode } from 'react';
import useFiles from '../hooks/useFiles';
import { FileItem, FolderItem } from '../types/filesTypes';

export interface FilesContextType {
  files: FileItem[],
  setFiles : React.Dispatch<React.SetStateAction<FileItem[]>>,
  folders: FolderItem[],
  setFolders: React.Dispatch<React.SetStateAction<FolderItem[]>>,
  isLoading: boolean,
  searchTerm: string,
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
}

const FilesContext = createContext<FilesContextType | undefined>(undefined);

interface FilesProviderProps {
  children: ReactNode;
}

export const FilesProvider: React.FC<FilesProviderProps> = ({ children }) => {
  const {files, folders, error, isLoading,setFolders,setFiles} = useFiles()
  const [searchTerm, setSearchTerm] = useState('');

  const contextValue = useMemo(() => ({
    files,
    isLoading,
    error,
    folders,
    searchTerm,
    setSearchTerm,
    setFolders,
    setFiles
  }), [error, files, folders, isLoading, searchTerm, setFiles, setFolders]);

  return (
    <FilesContext.Provider value={contextValue}>
      {children}
    </FilesContext.Provider>
  );
};

export { FilesContext };